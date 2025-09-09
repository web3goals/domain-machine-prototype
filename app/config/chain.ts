import { defineChain, parseEther } from "viem";

const domaTestnet = defineChain({
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

export const chainConfig = {
  chain: domaTestnet,
  seaportContractAddress: "0x0000000000000068F116a894984e2DB1123eB395",
  seaportVersion: "1.6",
  buyBoxValue: parseEther("0.005"),
  buyDomainValue: parseEther("0.0015"),
  buyTokenAddress: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
  buyTokenSymbol: "WETH",
};
