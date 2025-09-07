import { SeaportOperationHandler } from "../seaport-operation.handler";
import { DomaOrderbookError, DomaOrderbookErrorCode } from "../../errors";
import type { AcceptOfferParams, AcceptOfferResult } from "./types";
import type { TransactionReceipt } from "ethers";

export class AcceptOfferHandler extends SeaportOperationHandler<
  AcceptOfferParams,
  AcceptOfferResult
> {
  public async execute(params: AcceptOfferParams): Promise<AcceptOfferResult> {
    const walletAddress = await this.getWalletAddress();

    const offer = await this.apiClient.getOffer({
      orderId: params.orderId,
      fulFillerAddress: walletAddress,
    });

    if (!offer) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.ORDER_NOT_FOUND,
        "Offer not found"
      );
    }

    console.log({ offer });

    try {
      const orderUseCase = await this.seaport.fulfillOrder({
        order: offer.order,
        extraData: offer.extraData,
      });

      console.log({ orderUseCase });

      const result = await this.executeBlockchainOperation<TransactionReceipt>(
        orderUseCase.actions
      );

      return {
        gasPrice: result.gasPrice,
        gasUsed: result.gasUsed,
        transactionHash: result.hash as `0x${string}`,
        status: result.status === 1 ? "success" : "reverted",
      };
    } catch (error) {
      console.error(error);
      throw DomaOrderbookError.fromError(
        error,
        DomaOrderbookErrorCode.ACCEPT_OFFER_FAILED,
        {
          chainId: this.chainId,
          params,
        }
      );
    }
  }
}
