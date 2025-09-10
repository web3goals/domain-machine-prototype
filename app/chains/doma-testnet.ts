import { defineChain } from "viem";

export const domaTestnet = defineChain({
  id: 97476,
  name: "Doma Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.doma.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Doma Testnet Blockchain Explorer",
      url: "https://explorer-testnet.doma.xyz",
    },
  },
  testnet: true,
});
