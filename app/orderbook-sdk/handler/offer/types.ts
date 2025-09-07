import type { ItemType } from "@opensea/seaport-js/lib/constants";
import type { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import type {
  CancellationType,
  OrderbookFee,
  OrderbookType,
} from "../../types";
import type { Hex } from "viem";

export interface OfferItem {
  contract: string;
  tokenId: string;
  price: string;
  currencyContractAddress: string;
  duration?: number;
  itemType?: ItemType.ERC721 | ItemType.ERC1155;
}

export interface CreateOfferParams {
  items: OfferItem[];
  source: string;
  orderbook: OrderbookType;
  marketplaceFees?: OrderbookFee[];
  restrictedByZone?: boolean;
  zone?: string;
}

export interface CreateOfferResult {
  orders?: {
    orderId: string;
    orderData: OrderWithCounter;
  }[];
}

export interface AcceptOfferParams {
  orderId: string;
}

export interface AcceptOfferResult {
  transactionHash: Hex;
  status: "success" | "reverted";
  gasUsed: bigint;
  gasPrice: bigint;
}

export interface CancelOfferParams {
  orderId: string;
  cancellationType?: CancellationType;
}

export interface CancelOfferResult {
  transactionHash: Hex | null;
  status: "success" | "reverted";
  gasUsed: bigint;
  gasPrice: bigint;
}
