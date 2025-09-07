import axios, { type AxiosRequestConfig, type Method, isAxiosError } from 'axios';

import {
  CreateListingRequest,
  CreateListingResponse,
  GetOrderRequest,
  GetOrderResponse,
  CreateOfferRequest,
  CreateOfferResponse,
  GetOrderbookFeeRequest,
  GetOrderbookFeeResponse,
  CancelOfferResponse,
  CancelOfferRequest,
  CancelListingRequest,
  CancelListingResponse,
  GetSupportedCurrenciesRequest,
  GetSupportedCurrenciesResponse,
} from './types';

export interface RequestOptions {
  customHeaders?: Record<string, string>;
  timeout?: number;
}

export interface ApiClientOptions {
  /** The base URL to use for requests. */
  baseUrl: string;
  /** Default headers to be sent with every request. Can be overridden by per-request customHeaders. */
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private readonly clientOptions: ApiClientOptions;

  constructor(clientOptions: ApiClientOptions) {
    this.clientOptions = clientOptions;
  }

  public async createListing(
    params: CreateListingRequest,
    options?: RequestOptions,
  ): Promise<CreateListingResponse> {
    return this.makeRequest<CreateListingRequest, CreateListingResponse>(
      '/v1/orderbook/list',
      'post',
      params,
      options,
    );
  }

  public async createOffer(
    params: CreateOfferRequest,
    options?: RequestOptions,
  ): Promise<CreateOfferResponse> {
    return this.makeRequest<CreateOfferRequest, CreateOfferResponse>(
      '/v1/orderbook/offer',
      'post',
      params,
      options,
    );
  }

  public async getListing(
    params: GetOrderRequest,
    options?: RequestOptions,
  ): Promise<GetOrderResponse> {
    return this.makeRequest<GetOrderRequest, GetOrderResponse>(
      `/v1/orderbook/listing/${params.orderId}/${params.fulFillerAddress}`,
      'get',
      undefined,
      options,
    );
  }

  public async getOffer(
    params: GetOrderRequest,
    options?: RequestOptions,
  ): Promise<GetOrderResponse> {
    return this.makeRequest<GetOrderRequest, GetOrderResponse>(
      `/v1/orderbook/offer/${params.orderId}/${params.fulFillerAddress}`,
      'get',
      undefined,
      options,
    );
  }

  public async getOrderbookFee(
    params: GetOrderbookFeeRequest,
    options?: RequestOptions,
  ): Promise<GetOrderbookFeeResponse> {
    return this.makeRequest<GetOrderbookFeeRequest, GetOrderbookFeeResponse>(
      `/v1/orderbook/fee/${params.orderbook}/${params.chainId}/${params.contractAddress}`,
      'get',
      undefined,
      options,
    );
  }

  public async getSupportedCurrencies(
    params: GetSupportedCurrenciesRequest,
    options?: RequestOptions,
  ): Promise<GetSupportedCurrenciesResponse> {
    return this.makeRequest(
      `/v1/orderbook/currencies/${params.chainId}/${params.contractAddress}/${params.orderbook}`,
      'get',
      undefined,
      options,
    );
  }

  public async cancelOffer(params: CancelOfferRequest, options?: RequestOptions) {
    return this.makeRequest<CancelOfferRequest, CancelOfferResponse>(
      '/v1/orderbook/offer/cancel',
      'post',
      params,
      options,
    );
  }

  public async cancelListing(params: CancelListingRequest, options?: RequestOptions) {
    return this.makeRequest<CancelListingRequest, CancelListingResponse>(
      '/v1/orderbook/listing/cancel',
      'post',
      params,
      options,
    );
  }

  private async makeRequest<TRequest, TResponse>(
    endpoint: string,
    method: Method,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const finalHeaders: Record<string, string> = {
      ...(this.clientOptions.defaultHeaders || {}),
      ...(options?.customHeaders || {}),
    };

    // Set default Content-Type for relevant methods if data exists and not already set
    const hasData = data !== undefined && data !== null;
    const relevantMethodForContentType =
      method.toLowerCase() === 'post' ||
      method.toLowerCase() === 'put' ||
      method.toLowerCase() === 'patch';

    if (
      relevantMethodForContentType &&
      hasData &&
      !Object.keys(finalHeaders).some((key) => key.toLowerCase() === 'content-type')
    ) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    const axiosConfig: AxiosRequestConfig = {
      url: `${this.clientOptions.baseUrl}${endpoint}`,
      method: method,
      timeout: options?.timeout,
      headers: finalHeaders,
    };

    if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
      axiosConfig.params = data;
    } else if (hasData) {
      axiosConfig.data = data;
    }

    try {
      const response = await axios.request(axiosConfig);

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`,
        );
      }

      return response.data as TResponse;
    } catch (error) {
      if (isAxiosError(error)) {
        let errorMessage = `API request failed: ${error.message}`;
        if (error.response) {
          errorMessage = `API request failed with status ${error.response.status}: ${error.response.statusText}`;
          if (error.response.data) {
            const responseDataStr = JSON.stringify(error.response.data).substring(0, 200);
            errorMessage += ` - Data: ${responseDataStr}`;
          }
        }
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}
