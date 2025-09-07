import {
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";

const WETH_ADDRESSES: Record<number, string> = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [sepolia.id]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  [base.id]: "0x4200000000000000000000000000000000000006",
  [baseSepolia.id]: "0x4200000000000000000000000000000000000006",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [optimismSepolia.id]: "0x4200000000000000000000000000000000000006",
  [97476]: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
} as const;

export const getWethAddress = (chainId: number): string => {
  const address = WETH_ADDRESSES[chainId];
  if (!address) {
    throw new Error("Unsupported chain");
  }
  return address;
};
