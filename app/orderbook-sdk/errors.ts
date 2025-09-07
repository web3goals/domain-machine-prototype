export enum DomaOrderbookErrorCode {
  // Generic errors
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  SIGNER_NOT_PROVIDED = 'SIGNER_NOT_PROVIDED',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Seaport specific
  SEAPORT_APPROVAL_FAILED = 'SEAPORT_APPROVAL_FAILED',
  SEAPORT_SIGNATURE_FAILED = 'SEAPORT_SIGNATURE_FAILED',
  SEAPORT_TRANSACTION_FAILED = 'SEAPORT_TRANSACTION_FAILED',

  // Listing specific
  LISTING_CREATION_FAILED = 'LISTING_CREATION_FAILED',
  LISTING_VALIDATION_FAILED = 'LISTING_VALIDATION_FAILED',
  BUY_LISTING_FAILED = 'BUY_LISTING_FAILED',
  LISTING_CANCELLATION_FAILED = 'LISTING_CANCELLATION_FAILED',

  // Offer specific
  OFFER_CREATION_FAILED = 'OFFER_CREATION_FAILED',
  OFFER_VALIDATION_FAILED = 'OFFER_VALIDATION_FAILED',
  ACCEPT_OFFER_FAILED = 'ACCEPT_OFFER_FAILED',
  OFFER_CANCELLATION_FAILED = 'OFFER_CANCELLATION_FAILED',

  // Order specific
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  OFFCHAIN_CANCEL_ORDER_FAILED = 'OFFCHAIN_CANCEL_ORDER_FAILED',

  // Token specific
  TOKEN_CONVERSION_FAILED = 'TOKEN_CONVERSION_FAILED',
  INSUFFICIENT_ETH_BALANCE = 'INSUFFICIENT_ETH_BALANCE',

  // Fees
  FETCH_FEES_FAILED = 'FETCH_FEES_FAILED',

  // SDK specific
  CLIENT_NOT_INITIALIZED = 'CLIENT_NOT_INITIALIZED',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
}

export class DomaOrderbookError extends Error {
  public readonly timestamp: number;

  constructor(
    public readonly code: DomaOrderbookErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomaOrderbookError';
    this.timestamp = Date.now();
  }

  static fromError(
    error: unknown,
    defaultCode = DomaOrderbookErrorCode.UNKNOWN_ERROR,
    context?: Record<string, unknown>,
  ): DomaOrderbookError {
    if (error instanceof DomaOrderbookError) {
      return error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new DomaOrderbookError(defaultCode, message, error, context);
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}
