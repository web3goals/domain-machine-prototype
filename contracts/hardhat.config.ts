import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
import { configVariable } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    domaTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 97476,
      url: "https://rpc-testnet.doma.xyz/",
      accounts: [configVariable("DOMA_PRIVATE_KEY")],
    },
  },
  chainDescriptors: {
    97476: {
      name: "Doma Testnet",
      chainType: "l1",
      blockExplorers: {
        blockscout: {
          apiUrl: "https://explorer-doma-dev-ix58nm4rnd.t.conduit.xyz/api",
          url: "https://explorer-doma-dev-ix58nm4rnd.t.conduit.xyz:443",
        },
      },
    },
  },
};

export default config;
