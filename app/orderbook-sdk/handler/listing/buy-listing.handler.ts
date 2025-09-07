import { SeaportOperationHandler } from '../seaport-operation.handler';
import { DomaOrderbookError, DomaOrderbookErrorCode } from '../../errors';

import type { BuyListingParams, BuyListingResult } from './types';
import type { TransactionReceipt } from 'ethers';

export class BuyListingHandler extends SeaportOperationHandler<BuyListingParams, BuyListingResult> {
  public async execute(params: BuyListingParams): Promise<BuyListingResult> {
    const walletAddress = await this.signer.getAddress();

    const listing = await this.apiClient.getListing({
      orderId: params.orderId,
      fulFillerAddress: walletAddress,
    });

    if (!listing) {
      throw new DomaOrderbookError(DomaOrderbookErrorCode.ORDER_NOT_FOUND, 'Listing not found');
    }

    try {
      const orderUseCase = await this.seaport.fulfillOrder({
        order: {
          signature: listing.signature,
          parameters: listing.parameters,
        },
      });

      const result = await this.executeBlockchainOperation<TransactionReceipt>(
        orderUseCase.actions,
      );

      return {
        gasPrice: result.gasPrice,
        gasUsed: result.gasUsed,
        transactionHash: result.hash as `0x${string}`,
        status: result.status === 1 ? 'success' : 'reverted',
      };
    } catch (error) {
      throw DomaOrderbookError.fromError(error, DomaOrderbookErrorCode.BUY_LISTING_FAILED, {
        chainId: this.chainId,
        params,
      });
    }
  }
}
