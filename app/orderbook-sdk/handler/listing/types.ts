import type { ItemType } from '@opensea/seaport-js/lib/constants';
import type { OrderWithCounter } from '@opensea/seaport-js/lib/types';
import type { CancellationType, OrderbookFee, OrderbookType } from '../../types';
import type { Hex } from 'viem';

export interface ListingItem {
  contract: string;
  tokenId: string;
  price: string;
  currencyContractAddress?: string;
  duration?: number;
  itemType?: ItemType.ERC721 | ItemType.ERC1155;
}

export interface CreateListingParams {
  items: ListingItem[];
  source: string;
  orderbook: OrderbookType;
  marketplaceFees?: OrderbookFee[];
}

export interface CreateListingResult {
  orders?: {
    orderId: string;
    orderData: OrderWithCounter;
  }[];
}

export interface BuyListingParams {
  orderId: string;
}

export interface BuyListingResult {
  transactionHash: Hex;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  gasPrice: bigint;
}

export interface CancelListingParams {
  orderId: string;
  cancellationType?: CancellationType;
}

export interface CancelListingResult {
  transactionHash: Hex | null;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  gasPrice: bigint;
}
