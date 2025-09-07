import type { OrderComponents } from '@opensea/seaport-js/lib/types';

import type { Caip2ChainId, CurrencyToken, OrderbookFee, OrderbookType } from '../types';

export interface CreateListingRequest {
  signature: string;
  orderbook: string;
  chainId: Caip2ChainId;
  parameters: OrderComponents;
}

export interface CreateListingResponse {
  orderId: string;
  fulFillerAddress: string;
}

export interface GetOrderRequest {
  orderId: string;
  fulFillerAddress: string;
}

export interface GetOrderResponse {
  signature: string;
  parameters: OrderComponents;
}

export interface CreateOfferRequest {
  signature: string;
  orderbook: string;
  chainId: Caip2ChainId;
  parameters: OrderComponents;
}

export interface CreateOfferResponse {
  orderId: string;
}

export interface GetOrderbookFeeRequest {
  contractAddress: string;
  orderbook: OrderbookType;
  chainId: Caip2ChainId;
}

export interface GetOrderbookFeeResponse {
  marketplaceFees: OrderbookFee[];
}

export interface CancelOfferRequest {
  orderId: string;
  signature: string;
}

export interface CancelOfferResponse {
  orderId: string;
}

export interface CancelListingRequest {
  orderId: string;
  signature: string;
}

export interface CancelListingResponse {
  orderId: string;
}

export interface GetSupportedCurrenciesRequest {
  chainId: Caip2ChainId;
  orderbook: OrderbookType;
  contractAddress: string;
}

export interface GetSupportedCurrenciesResponse {
  currencies: CurrencyToken[];
}
