import type {
  Caip2ChainId,
  DomaOrderbookSDKConfig,
  OnProgressCallback,
  OrderbookFee,
} from "./types";
import type {
  BuyListingParams,
  BuyListingResult,
  CancelListingParams,
  CancelListingResult,
  CreateListingParams,
  CreateListingResult,
} from "./handler/listing/types";
import { ListingHandler } from "./handler/listing/create-listing.handler";
import { ApiClient } from "./api/api.client";
import { DomaOrderbookError, DomaOrderbookErrorCode } from "./errors";
import { BuyListingHandler } from "./handler/listing/buy-listing.handler";
import type {
  AcceptOfferParams,
  AcceptOfferResult,
  CancelOfferParams,
  CancelOfferResult,
  CreateOfferParams,
  CreateOfferResult,
} from "./handler/offer/types";
import { CreateOfferHandler } from "./handler/offer/create-offer.handler";
import { AcceptOfferHandler } from "./handler/offer/accept-offer.handler";
import { getWethAddress } from "./utils/weth.utils";
import { parseChainId } from "./utils/chain.utils";
import { CancelOfferHandler } from "./handler/offer/cancel-offer.handler";
import { CancelListingHandler } from "./handler/listing/cancel-listing.handler";
import type {
  GetOrderbookFeeRequest,
  GetOrderbookFeeResponse,
  GetSupportedCurrenciesRequest,
  GetSupportedCurrenciesResponse,
} from "./api/types";
import { JsonRpcSigner } from "ethers";

export class DomaOrderbookSDK {
  public readonly config: DomaOrderbookSDKConfig;
  private readonly apiClient: ApiClient;

  public constructor(config: DomaOrderbookSDKConfig) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiClientOptions);
  }

  private validateSignerAndChainProvided(
    signer: JsonRpcSigner,
    chainId: Caip2ChainId
  ) {
    if (!signer) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.SIGNER_NOT_PROVIDED,
        "Signer must be provided"
      );
    }

    if (!chainId) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.INVALID_PARAMETERS,
        "Chain ID must be provided"
      );
    }
  }

  private async fetchFeesIfNeeded(
    params: CreateListingParams | CreateOfferParams,
    chainId: Caip2ChainId
  ): Promise<OrderbookFee[]> {
    // if provided just return
    if (params.marketplaceFees) {
      return params.marketplaceFees;
    }

    const feeRequest = {
      contractAddress: params.items[0].contract,
      chainId: chainId,
      orderbook: params.orderbook,
    };

    try {
      const feeResponse = await this.getOrderbookFee(feeRequest);

      return params.marketplaceFees || feeResponse.marketplaceFees || [];
    } catch (error) {
      throw DomaOrderbookError.fromError(
        error,
        DomaOrderbookErrorCode.FETCH_FEES_FAILED,
        {
          chainId,
          params,
        }
      );
    }
  }

  public async createListing({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: CreateListingParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<CreateListingResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    // set fees
    const marketplaceFees = await this.fetchFeesIfNeeded(params, chainId);
    const paramsWithFees = {
      ...params,
      marketplaceFees,
    };

    const handler = new ListingHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(paramsWithFees);
  }

  public async buyListing({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: BuyListingParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<BuyListingResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    const handler = new BuyListingHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(params);
  }

  public async createOffer({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: CreateOfferParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<CreateOfferResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    // Fetch fees if needed
    const marketplaceFees = await this.fetchFeesIfNeeded(params, chainId);
    const paramsWithFee = {
      ...params,
      marketplaceFees,
    };

    // Check if any item uses WETH as payment token
    const hasWethOffer = params.items?.some(
      (item) =>
        getWethAddress(parseChainId(chainId)) === item.currencyContractAddress
    );

    const handler = new CreateOfferHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress,
      {
        seaportBalanceAndApprovalChecksOnOrderCreation: !hasWethOffer, // Skip only for WETH offers
      }
    );

    return handler.execute(paramsWithFee);
  }

  public async acceptOffer({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: AcceptOfferParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<AcceptOfferResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    const handler = new AcceptOfferHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(params);
  }

  public async cancelListing({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: CancelListingParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<CancelListingResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    const handler = new CancelListingHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(params);
  }

  public async cancelOffer({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: CancelOfferParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<CancelOfferResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    const handler = new CancelOfferHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(params);
  }

  public async getOrderbookFee(
    params: GetOrderbookFeeRequest
  ): Promise<GetOrderbookFeeResponse> {
    return this.apiClient.getOrderbookFee(params);
  }

  public async getSupportedCurrencies(
    params: GetSupportedCurrenciesRequest
  ): Promise<GetSupportedCurrenciesResponse> {
    return this.apiClient.getSupportedCurrencies(params);
  }
}

let client: DomaOrderbookSDK | null = null;

export const createDomaOrderbookClient = (
  config: DomaOrderbookSDKConfig
): DomaOrderbookSDK => {
  client = new DomaOrderbookSDK(config);
  return client;
};

export const getDomaOrderbookClient = (): DomaOrderbookSDK => {
  if (!client) {
    throw new DomaOrderbookError(
      DomaOrderbookErrorCode.CLIENT_NOT_INITIALIZED,
      "DomaOrderbookClient not initialized. Call createDomaOrderbookClient first."
    );
  }

  return client;
};
