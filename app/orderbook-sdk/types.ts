import type { Chain } from 'viem';

import type { ApiClientOptions } from './api/api.client';

export interface DomaOrderbookSDKConfig {
  source: string;
  chains: Chain[];
  apiClientOptions: ApiClientOptions;
}

export type TxHash = {
  txHash: string;
  chainId: number;
};

export type ProgressStep = {
  status: 'incomplete' | 'complete' | 'error';
  kind: 'transaction' | 'signature' | 'api';
  action: string;
  description: string;
  progressState?: 'pending' | 'submitted' | 'confirmed';
  txHashes?: TxHash[];
  error?: string;
  errorData?: unknown;
};

export type OnProgressCallback = (progress: ProgressStep[]) => void;

export type Caip2ChainId = `${'eip155'}:${number}`;

export enum OrderbookType {
  DOMA = 'DOMA',
  OPENSEA = 'OPENSEA',
}

export type CancellationType = 'on-chain' | 'off-chain';

export enum FeeType {
  DOMA = 'DOMA',
  OPENSEA = 'OPENSEA',
  ROYALTY = 'ROYALTY',
}

export type OrderbookFee = {
  recipient: string;
  basisPoints: number;
  feeType: FeeType;
};

export interface CurrencyToken {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}
