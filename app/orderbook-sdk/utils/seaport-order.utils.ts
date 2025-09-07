import type {
  ConsiderationInputItem,
  CreateInputItem,
  CreateOrderInput,
  CurrencyItem,
  Fee,
} from '@opensea/seaport-js/lib/types';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import type { ListingItem } from '../handler/listing/types';
import type { OfferItem } from '../handler/offer/types';
import { ZeroAddress } from 'ethers';
import type { OrderbookFee } from '../types';

export function prepareFees(marketplaceFees?: OrderbookFee[]): Fee[] {
  return [
    ...(marketplaceFees || []).map((fee) => ({
      recipient: fee.recipient,
      basisPoints: fee.basisPoints,
    })),
  ];
}

export function buildListingOrderInput(
  item: ListingItem,
  sellerAddress: string,
  endTime: number,
  fees: Fee[],
): CreateOrderInput {
  const offerer = sellerAddress;

  const offerItems: CreateInputItem[] = [];
  if (item.itemType === ItemType.ERC1155) {
    offerItems.push({
      itemType: ItemType.ERC1155,
      token: item.contract,
      identifier: item.tokenId,
      amount: '1',
    });
  } else {
    offerItems.push({
      itemType: ItemType.ERC721,
      token: item.contract,
      identifier: item.tokenId,
    });
  }

  const considerationItems: ConsiderationInputItem[] = [];
  if (item.currencyContractAddress && item.currencyContractAddress !== ZeroAddress) {
    considerationItems.push({
      token: item.currencyContractAddress,
      amount: item.price,
      recipient: offerer,
    });
  } else {
    considerationItems.push({
      amount: item.price,
      recipient: offerer,
    });
  }

  return {
    offerer,
    endTime: endTime.toString(),
    offer: offerItems,
    consideration: considerationItems,
    fees,
  } as CreateOrderInput;
}

export function buildOfferOrderInput(
  item: OfferItem,
  buyerAddress: string,
  endTime: number,
  fees: Fee[],
): CreateOrderInput {
  const offerer = buyerAddress;

  const offerItems: CurrencyItem[] = [
    {
      token: item.currencyContractAddress,
      amount: item.price,
    },
  ];

  const considerationItems: ConsiderationInputItem[] = [];
  if (item.itemType === ItemType.ERC1155) {
    considerationItems.push({
      itemType: ItemType.ERC1155,
      token: item.contract,
      identifier: item.tokenId,
      amount: '1',
      recipient: offerer,
    });
  } else {
    considerationItems.push({
      itemType: ItemType.ERC721,
      token: item.contract,
      identifier: item.tokenId,
      recipient: offerer,
    });
  }

  return {
    offerer,
    endTime: endTime.toString(),
    offer: offerItems,
    consideration: considerationItems,
    fees,
  } as CreateOrderInput;
}
