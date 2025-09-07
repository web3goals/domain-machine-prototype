import { SeaportOperationHandler } from '../seaport-operation.handler';
import { DomaOrderbookError, DomaOrderbookErrorCode } from '../../errors';
import type { CancelOfferParams, CancelOfferResult } from './types';
import { createOffChainCancelAction, type OffChainCancel } from '../actions/offchain-cancel.action';
import { parseChainId } from '../../utils/chain.utils';
import type { GetOrderResponse } from '../../api/types';
import type { TransactionReceipt } from 'ethers';

export class CancelOfferHandler extends SeaportOperationHandler<
  CancelOfferParams,
  CancelOfferResult
> {
  private async validateAndGetOffer(orderId: string, fulFillerAddress: string) {
    const offer = await this.apiClient.getOffer({
      orderId,
      fulFillerAddress,
    });

    if (!offer) {
      throw new DomaOrderbookError(DomaOrderbookErrorCode.ORDER_NOT_FOUND, 'Offer not found');
    }

    return offer;
  }

  private async cancelOffChain(orderId: string): Promise<CancelOfferResult> {
    const seaportAddress = await this.seaport.contract.getAddress();

    // Create the cancel action
    const offchainCancelAction = createOffChainCancelAction(
      this.signer,
      orderId,
      seaportAddress,
      parseChainId(this.chainId),
    );

    const cancelResult = await this.executeBlockchainOperation<OffChainCancel>([
      offchainCancelAction,
    ]);

    await this.apiClient.cancelOffer({
      orderId: orderId,
      signature: cancelResult.signature,
    });

    return {
      transactionHash: null,
      status: 'success',
      gasUsed: 0n,
      gasPrice: 0n,
    };
  }

  private async cancelOnChain(offer: GetOrderResponse): Promise<CancelOfferResult> {
    // Use Seaport to cancel the order on-chain
    const cancelOrdersAction = this.seaport.cancelOrders([
      {
        ...offer.parameters,
      },
    ]);

    // Execute the cancellation transaction
    const result = await this.executeBlockchainOperation<TransactionReceipt>([
      {
        type: 'cancelOrder',
        transactionMethods: cancelOrdersAction,
      },
    ]);

    return {
      gasPrice: result.gasPrice,
      gasUsed: result.gasUsed,
      transactionHash: result.hash as `0x${string}`,
      status: result.status === 1 ? 'success' : 'reverted',
    };
  }

  public async execute(params: CancelOfferParams): Promise<CancelOfferResult> {
    const walletAddress = await this.getWalletAddress();

    try {
      const offer = await this.validateAndGetOffer(params.orderId, walletAddress);

      if (params.cancellationType === 'off-chain') {
        return await this.cancelOffChain(params.orderId);
      }

      return await this.cancelOnChain(offer);
    } catch (error) {
      throw DomaOrderbookError.fromError(error, DomaOrderbookErrorCode.OFFER_CANCELLATION_FAILED, {
        chainId: this.chainId,
        params,
      });
    }
  }
}
