import type { Overrides, Signer } from 'ethers';
import type { TransactionMethods } from '@opensea/seaport-js/src/utils/usecase';
import type { Weth } from '../../contracts';

export type WethConversionAction = {
  type: 'conversion';
  transactionMethods: TransactionMethods;
};

export const createWethDepositTransaction = (
  signer: Signer | Promise<Signer>,
  wethContract: Weth,
  value: bigint,
): TransactionMethods => {
  const getConnectedContract = async () => wethContract.connect(await signer);

  return {
    transact: async (overrides?: Overrides) => {
      const mergedOverrides = { ...overrides, value };
      const contract = await getConnectedContract();
      return contract.deposit(mergedOverrides);
    },
    staticCall: async (overrides?: Overrides) => {
      const mergedOverrides = { ...overrides, value };
      const contract = await getConnectedContract();
      return contract.deposit.staticCall(mergedOverrides);
    },
    estimateGas: async (overrides?: Overrides) => {
      const mergedOverrides = { ...overrides, value };
      const contract = await getConnectedContract();
      return contract.deposit.estimateGas(mergedOverrides);
    },
    buildTransaction: async (overrides?: Overrides) => {
      const mergedOverrides = { ...overrides, value };
      const contract = await getConnectedContract();
      return contract.deposit.populateTransaction(mergedOverrides);
    },
  };
};
