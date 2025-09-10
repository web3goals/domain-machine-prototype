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
  treasuryContractAddress: "0x2168609301437822c7ad3f35114b10941866f20a",
  buyBoxValue: parseEther("0.005"),
  buyDomainValue: parseEther("0.0015"),
  buyTokenAddress: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
  buyTokenSymbol: "WETH",
  buyFees: {
    domaProtocolFee: {
      amount: parseEther("0.0000075"), // 0.5% of 0.0015 ETH
      recipient: "0x2e7cc63800e77bb8c662c45ef33d1ccc23861532",
    },
    nameTokenRoyalties: {
      amount: parseEther("0.0000375"), // 2.5% of 0.0015 ETH
      recipient: "0x5318579e61a7a6cd71a8fd163c1a6794b2695e2b",
    },
  },
  buyZone: "0xCEF2071b4246DB4D0E076A377348339f31a07dEA",
};
