import type {
  CreateBulkOrdersAction,
  CreateOrderAction,
  ExchangeAction,
  ApprovalAction,
} from '@opensea/seaport-js/lib/types';

import type { ProgressStep, TxHash } from './types';
import { DomaOrderbookError, DomaOrderbookErrorCode } from './errors';
import type { WethConversionAction } from './handler/actions/weth.action';
import type {
  ContractMethodReturnType,
  TransactionMethods,
} from '@opensea/seaport-js/src/utils/usecase';
import type { SeaportContract } from '@opensea/seaport-js/src/types';
import type { OffChainCancelAction } from './handler/actions/offchain-cancel.action';

type ActionType =
  | 'create'
  | 'createBulk'
  | 'exchange'
  | 'approval'
  | 'conversion'
  | 'cancelOrder'
  | 'offChainCancel';

type CancelOrderAction = {
  type: 'cancelOrder';
  transactionMethods: TransactionMethods<ContractMethodReturnType<SeaportContract, 'cancel'>>;
};

export type BlockchainActions =
  | CreateOrderAction
  | CreateBulkOrdersAction
  | ExchangeAction
  | ApprovalAction
  | WethConversionAction
  | CancelOrderAction
  | OffChainCancelAction;

const getActionDescription = (actionType: ActionType): string => {
  switch (actionType) {
    case 'create':
      return 'Creating order';
    case 'createBulk':
      return 'Creating bulk orders';
    case 'exchange':
      return 'Fulfilling order';
    case 'approval':
      return 'Approving token';
    case 'conversion':
      return 'Converting token';
    case 'cancelOrder':
      return 'Canceling order (on-chain)';
    case 'offChainCancel':
      return 'Canceling order (off-chain)';
    default:
      return `Executing ${actionType}`;
  }
};

export const prepareActionSteps = (actions: ReadonlyArray<BlockchainActions>): ProgressStep[] => {
  return actions.map((action): ProgressStep => {
    if (action.type === 'approval') {
      const approvalAction = action as ApprovalAction;
      return {
        status: 'incomplete',
        kind: 'transaction',
        action: approvalAction.type,
        description: getActionDescription(action.type),
      };
    }

    if (
      action.type === 'create' ||
      action.type === 'createBulk' ||
      action.type === 'exchange' ||
      action.type === 'conversion' ||
      action.type === 'cancelOrder' ||
      action.type === 'offChainCancel'
    ) {
      return {
        status: 'incomplete',
        kind:
          action.type === 'create' ||
          action.type === 'createBulk' ||
          action.type === 'offChainCancel'
            ? 'signature'
            : 'transaction',
        action: action.type,
        description: getActionDescription(action.type),
      };
    }

    throw new Error(`Unsupported action type: ${action}`);
  });
};

export class Progress {
  public items: ProgressStep[] = [];
  public currentStepIndex = 0;
  public totalSteps = 0;
  private readonly progressCallback?: (progress: ProgressStep[]) => void;

  constructor(steps: ProgressStep[], progressCallback?: (progress: ProgressStep[]) => void) {
    this.items = steps;
    this.totalSteps = steps.length;

    this.progressCallback = progressCallback;
  }

  public updateStep(index: number, updateInfo: Partial<ProgressStep>): void {
    if (index < 0 || index >= this.items.length) {
      throw new Error(`Step index out of bounds: ${index}`);
    }

    this.items[index] = {
      ...this.items[index],
      ...updateInfo,
    };

    this.notifyProgress();
  }

  public completeStep(index: number, updateInfo?: Partial<ProgressStep>): void {
    if (index < 0 || index >= this.items.length) {
      throw new Error(`Step index out of bounds: ${index}`);
    }

    this.items[index] = {
      ...this.items[index],
      ...(updateInfo || {}),
      status: 'complete',
      progressState: this.items[index].kind === 'signature' ? undefined : 'confirmed',
    };

    // Auto-advance to next step
    if (index < this.totalSteps - 1) {
      this.currentStepIndex = index + 1;
    }

    this.notifyProgress();
  }

  public setTransactionSubmitted(index: number, txHash: string, chainId: number): void {
    if (index < 0 || index >= this.items.length) {
      throw new Error(`Step index out of bounds: ${index}`);
    }

    const txInfo: TxHash = { txHash, chainId };

    this.items[index] = {
      ...this.items[index],
      progressState: 'submitted',
      txHashes: this.items[index].txHashes ? [...this.items[index].txHashes, txInfo] : [txInfo],
    };

    this.notifyProgress();
  }

  private notifyProgress(): void {
    if (this.progressCallback) {
      this.progressCallback([...this.items]);
    }
  }

  public failStep(index: number, error: unknown): void {
    if (index < 0 || index >= this.items.length) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.INVALID_PARAMETERS,
        `Step index out of bounds: ${index}`,
      );
    }

    this.items[index] = {
      ...this.items[index],
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      errorData: error,
    };

    this.notifyProgress();
  }

  public isComplete(): boolean {
    return this.items.every((step) => step.status === 'complete');
  }
}

export const executeAllActions = async <R>(
  actions: ReadonlyArray<BlockchainActions>,
  options?: {
    onProgress?: (progress: ProgressStep[]) => void;
  },
): Promise<R> => {
  const { onProgress } = options || {};

  if (!actions?.length) {
    throw new DomaOrderbookError(DomaOrderbookErrorCode.INVALID_PARAMETERS, 'No actions provided');
  }

  const preparedSteps = prepareActionSteps(actions);
  const progress = new Progress(preparedSteps, onProgress);
  let finalResult: R | null = null;

  // Process all actions
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const isFinalAction = i === actions.length - 1;

    progress.updateStep(i, { progressState: 'pending' });

    try {
      // signature-based actions
      if (action.type === 'create') {
        const createResult = await action.createOrder();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = createResult as R;
        }
      } else if (action.type === 'createBulk') {
        const bulkResult = await action.createBulkOrders();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = bulkResult as R;
        }
      } else if (action.type === 'offChainCancel') {
        const cancelResult = await action.createCancelSignature();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = cancelResult as R;
        }
      }
      // transaction-based actions
      else {
        const tx = await action.transactionMethods.transact();

        if (tx) {
          progress.setTransactionSubmitted(i, tx.hash, Number(tx.chainId));
        }

        const txResult = await tx.wait();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = txResult as R;
        }
      }
    } catch (error) {
      progress.failStep(i, error);

      const actionType = action.type;
      const errorContext = {
        actionType,
        actionIndex: i,
        progress: progress.items,
      };

      if (actionType === 'approval') {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_APPROVAL_FAILED,
          `Failed to approve ${(action as ApprovalAction).token || 'token'}`,
          error,
          errorContext,
        );
      }

      if (actionType === 'create' || actionType === 'createBulk') {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_SIGNATURE_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext,
        );
      }

      if (actionType === 'offChainCancel') {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.OFFCHAIN_CANCEL_ORDER_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext,
        );
      }

      if (actionType === 'exchange' || actionType === 'cancelOrder') {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_TRANSACTION_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext,
        );
      }

      if (actionType === 'conversion') {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.TOKEN_CONVERSION_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext,
        );
      }

      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.UNKNOWN_ERROR,
        `Failed to execute ${actionType}`,
        error,
        errorContext,
      );
    }
  }

  if (!finalResult) {
    throw new DomaOrderbookError(
      DomaOrderbookErrorCode.UNKNOWN_ERROR,
      'Final result not found',
      null,
      {
        progress: progress.items,
      },
    );
  }

  return finalResult;
};
