import { network } from "hardhat";
import { domaTestnet } from "./chains/doma-testnet.js";
import Treasury from "../artifacts/contracts/Treasury.sol/Treasury.json";
import { Hex } from "viem";

async function main() {
  console.log("Deploying treasury...");

  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient({ chain: domaTestnet });
  const [wallet] = await viem.getWalletClients({ chain: domaTestnet });

  const hash = await wallet.deployContract({
    abi: Treasury.abi,
    bytecode: Treasury.bytecode as Hex,
    args: [wallet.account.address],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;
  console.log("Treasury deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
