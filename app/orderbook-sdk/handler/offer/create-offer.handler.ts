import type { Seaport } from "@opensea/seaport-js";
import type {
  OrderWithCounter,
  Fee,
  CreateOrderInput,
} from "@opensea/seaport-js/lib/types";

import { SeaportOperationHandler } from "../seaport-operation.handler";
import { DomaOrderbookError, DomaOrderbookErrorCode } from "../../errors";

import type { CreateOfferParams, CreateOfferResult, OfferItem } from "./types";
import {
  HOURS_IN_DAY,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from "../../utils/date.utils";
import {
  buildOfferOrderInput,
  prepareFees,
} from "../../utils/seaport-order.utils";
import { Weth__factory } from "../../contracts";
import type { BlockchainActions } from "../../core";
import {
  createWethDepositTransaction,
  type WethConversionAction,
} from "../actions/weth.action";
import { mapInputItemToOfferItem } from "@opensea/seaport-js/lib/utils/order";
import type { JsonRpcProvider, Signer } from "ethers";
import {
  getBalancesAndApprovals,
  validateOfferBalancesAndApprovals,
} from "@opensea/seaport-js/lib/utils/balanceAndApprovalCheck";
import { getApprovalActions } from "@opensea/seaport-js/lib/utils/approval";
import { getWethAddress } from "../../utils/weth.utils";
import { parseChainId } from "../../utils/chain.utils";

export class CreateOfferHandler extends SeaportOperationHandler<
  CreateOfferParams,
  CreateOfferResult
> {
  private readonly DEFAULT_LIST_DURATION =
    HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;

  public async execute(params: CreateOfferParams): Promise<CreateOfferResult> {
    try {
      const { items, marketplaceFees } = params;

      this.validateInputs(items);
      const walletAddress = await this.getWalletAddress();

      const fees = prepareFees(marketplaceFees);

      if (items.length !== 1) {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.INVALID_PARAMETERS,
          "Offer of multiple items is not supported"
        );
      }

      return await this.handleSingleOffer(
        items[0],
        walletAddress,
        this.seaport,
        fees,
        params
      );
    } catch (error) {
      throw DomaOrderbookError.fromError(
        error,
        DomaOrderbookErrorCode.LISTING_CREATION_FAILED,
        {
          chainId: this.chainId,
          params,
        }
      );
    }
  }

  private validateInputs(items: OfferItem[] | undefined): void {
    if (!items?.length) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.INVALID_PARAMETERS,
        "At least one item must be provided"
      );
    }
  }

  private async handleSingleOffer(
    item: OfferItem,
    walletAddress: string,
    seaport: Seaport,
    fees: Fee[],
    params: CreateOfferParams
  ): Promise<CreateOfferResult> {
    try {
      const endTime = Math.floor(
        (Date.now() + (item.duration || this.DEFAULT_LIST_DURATION)) /
          MILLISECONDS_IN_SECOND
      );
      const createOrderInput = buildOfferOrderInput(
        item,
        walletAddress,
        endTime,
        fees,
        params.restrictedByZone,
        params.zone
      );

      const actions: BlockchainActions[] = [];

      // check approval actions
      const approvalActions = await this.getApprovalActions(
        walletAddress,
        createOrderInput,
        this.signer,
        false
      );
      if (approvalActions.length) {
        actions.push(...approvalActions);
      }

      // check for WETH and WETH conversion actions
      if (
        getWethAddress(parseChainId(this.chainId)) ===
        item.currencyContractAddress
      ) {
        const weth = Weth__factory.connect(
          item.currencyContractAddress,
          this.signer
        );
        const wethBalance = await weth.balanceOf(walletAddress);
        const difference = BigInt(item.price) - wethBalance;

        if (difference > 0n) {
          const ethBalance = await this.signer.provider.getBalance(
            walletAddress
          );

          if (ethBalance < difference) {
            throw new DomaOrderbookError(
              DomaOrderbookErrorCode.INSUFFICIENT_ETH_BALANCE,
              "Insufficient funds to cover WETH conversion"
            );
          }

          const wethDepositTransaction: WethConversionAction = {
            type: "conversion",
            transactionMethods: createWethDepositTransaction(
              this.signer,
              weth,
              difference
            ),
          };
          actions.push(wethDepositTransaction);
        }
      }

      // build order actions
      const orderUseCase = await seaport.createOrder(
        createOrderInput,
        walletAddress
      );
      actions.push(...orderUseCase.actions);

      const result = await this.executeBlockchainOperation<OrderWithCounter>(
        actions
      );

      const listingResponse = await this.apiClient.createOffer({
        signature: result.signature,
        orderbook: params.orderbook,
        chainId: this.chainId,
        parameters: result.parameters,
      });

      return {
        orders: [{ orderId: listingResponse.orderId, orderData: result }],
      };
    } catch (error) {
      throw DomaOrderbookError.fromError(
        error,
        DomaOrderbookErrorCode.OFFER_CREATION_FAILED
      );
    }
  }

  private async getApprovalActions(
    offerer: string,
    order: CreateOrderInput,
    provider: JsonRpcProvider | Signer,
    exactApproval: boolean
  ) {
    const mappedOfferItems = order.offer.map(mapInputItemToOfferItem);

    // Get the conduit key from your order input (or use NO_CONDUIT as default)
    const conduitKey =
      order.conduitKey ||
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    // For NO_CONDUIT, the operator is the Seaport contract address itself
    const operator =
      conduitKey ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
        ? await this.seaport.contract.getAddress()
        : conduitKey;

    const balancesAndApprovals = await getBalancesAndApprovals({
      owner: offerer,
      items: mappedOfferItems,
      criterias: [],
      provider: provider as JsonRpcProvider,
      operator,
    });

    const insufficientApprovals = validateOfferBalancesAndApprovals({
      offer: mappedOfferItems,
      criterias: [],
      balancesAndApprovals,
      throwOnInsufficientBalances: false,
      operator,
    });

    return getApprovalActions(
      insufficientApprovals,
      exactApproval,
      provider as Signer
    );
  }
}
