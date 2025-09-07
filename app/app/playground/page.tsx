"use client";

import { domaTestnet } from "@/chains/doma-testnet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useError from "@/hooks/use-error";
import {
  createDomaOrderbookClient,
  OrderbookType,
  ProgressStep,
  viemToEthersSigner,
} from "@/orderbook-sdk";
import { Domain } from "@/types/domain";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { JsonRpcSigner } from "ethers";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Address, createWalletClient, custom, parseEther } from "viem";

export default function PlaygroundPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tighter">
        Playground page
      </h1>
      <Separator className="my-8" />
      <div className="flex flex-col gap-4">
        <PlaygroundDomainActions />
        <PlaygroundDomains />
        <PlaygroundPrivy />
      </div>
    </main>
  );
}

function PlaygroundDomainActions() {
  const { handleError } = useError();
  const {} = usePrivy();
  const { wallets } = useWallets();
  const [isProsessing, setIsProsessing] = useState(false);

  const tokenId =
    "107137215232458749996855170311736713895383956783073784797511084938723223236735";

  const domaClient = createDomaOrderbookClient({
    source: "",
    chains: [domaTestnet],
    apiClientOptions: {
      baseUrl: "https://api-testnet.doma.xyz",
      defaultHeaders: {
        "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY || "",
      },
    },
  });

  async function getSigner(): Promise<JsonRpcSigner> {
    // Check wallet
    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("Wallet undefined");
    }
    if (wallet.chainId.replace("eip155:", "") !== domaTestnet.id.toString()) {
      throw new Error("Wrong chain");
    }
    // Create signer
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: wallet.address as Address,
      chain: domaTestnet,
      transport: custom(provider),
    });
    return viemToEthersSigner(walletClient, "eip155:97476");
  }

  async function handleCreateListing() {
    try {
      setIsProsessing(true);
      console.log("Create listing...");

      const signer = await getSigner();
      const response = await domaClient.createListing({
        params: {
          items: [
            {
              contract: "0x424bdf2e8a6f52bd2c1c81d9437b0dc0309df90f",
              tokenId:
                "93330031014567397590553973486828247023557895934242564465224990746168111751210",
              price: parseEther("0.001").toString(),
              currencyContractAddress:
                "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
            },
          ],
          source: "",
          orderbook: OrderbookType.DOMA,
          restrictedByZone: true,
          zone: "0xCEF2071b4246DB4D0E076A377348339f31a07dEA",
        },
        signer: signer,
        chainId: "eip155:97476",
        onProgress: (step: ProgressStep[]) => {
          console.log(`Progress Step: ${JSON.stringify(step)}`);
        },
      });
      console.log(`response: ${JSON.stringify(response)}`);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  async function handleBuyListing() {
    try {
      setIsProsessing(true);
      console.log("Buy listing...");

      const signer = await getSigner();
      const response = await domaClient.buyListing({
        params: {
          orderId:
            "0xf92c7557b4b560bfd6f1439240fa0cf13fe4b303d8a926eb1883dcb82bf24f9a",
        },
        signer: signer,
        chainId: "eip155:97476",
        onProgress: (step: ProgressStep[]) => {
          console.log(`Progress Step: ${JSON.stringify(step)}`);
        },
      });
      console.log(`response: ${JSON.stringify(response)}`);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  async function handleCreateOffer() {
    try {
      setIsProsessing(true);
      console.log("Create offer...");

      const signer = await getSigner();
      const response = await domaClient.createOffer({
        params: {
          items: [
            {
              contract: "0x424bdf2e8a6f52bd2c1c81d9437b0dc0309df90f",
              tokenId: tokenId,
              price: parseEther("0.002").toString(),
              currencyContractAddress:
                "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
            },
          ],
          source: "",
          orderbook: OrderbookType.DOMA,
          restrictedByZone: true,
          zone: "0xCEF2071b4246DB4D0E076A377348339f31a07dEA",
        },
        signer: signer,
        chainId: "eip155:97476",
        onProgress: (step: ProgressStep[]) => {
          console.log(`Progress Step: ${JSON.stringify(step)}`);
        },
      });
      console.log(`response: ${JSON.stringify(response)}`);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  async function handleAcceptOffer() {
    try {
      setIsProsessing(true);
      console.log("Accept offer...");

      const signer = await getSigner();
      const response = await domaClient.acceptOffer({
        params: {
          orderId:
            "0x876b5a2b15c157891d5203223b18597bbe5bba55b3f2b167e6b11465e1de9691",
        },
        signer: signer,
        chainId: "eip155:97476",
        onProgress: (step: ProgressStep[]) => {
          console.log(`Progress Step: ${JSON.stringify(step)}`);
        },
      });
      console.log(`response: ${JSON.stringify(response)}`);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <div className="bg-card border p-6 rounded-xl">
      <h2 className="text-2xl font-bold">Domain Actions</h2>
      <div className="flex flex-row gap-2">
        <Button
          onClick={handleCreateListing}
          disabled={isProsessing}
          className="mt-4"
        >
          {isProsessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}
          Create Listing
        </Button>
        <Button
          onClick={handleBuyListing}
          disabled={isProsessing}
          className="mt-4"
        >
          {isProsessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}
          Buy Listing
        </Button>
        <Button
          onClick={handleCreateOffer}
          disabled={isProsessing}
          className="mt-4"
        >
          {isProsessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}
          Create Offer
        </Button>
        <Button
          onClick={handleAcceptOffer}
          disabled={isProsessing}
          className="mt-4"
        >
          {isProsessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}
          Accept Offer
        </Button>
      </div>
    </div>
  );
}

function PlaygroundDomains() {
  const { handleError } = useError();
  const [domains, setDomains] = useState<Domain[] | undefined>();
  const [isProsessing, setIsProsessing] = useState(false);

  async function handleLoadDomains() {
    try {
      setIsProsessing(true);
      console.log("Load domains...");

      const address = "0xcbFb1a51aCf21bdac6F62e41c6DfAd390e6Eb006";
      const query = `
query {
  names(
    take: 50
    ownedBy: ["eip155:1:${address}"]
    claimStatus: CLAIMED
    networkIds: ["eip155:97476"]
  ) {
    items {
      name
      tokens {
        tokenId
        tokenAddress
        ownerAddress
        networkId
      }
    }
    totalCount
  }
}
      `;

      const { data } = await axios.post(
        "https://api-testnet.doma.xyz/graphql",
        { query: query },
        {
          headers: {
            "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY,
          },
        }
      );

      const domains: Domain[] = [];
      for (const item of data.data.names.items) {
        for (const token of item.tokens) {
          domains.push({
            name: item.name,
            tokenId: token.tokenId,
            tokenAddress: token.tokenAddress,
            ownerAddress: token.ownerAddress,
            networkId: token.networkId,
          });
        }
      }
      setDomains(domains);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <div className="bg-card border p-6 rounded-xl">
      <h2 className="text-2xl font-bold">Domains</h2>
      <Button
        onClick={handleLoadDomains}
        disabled={isProsessing}
        className="mt-4"
      >
        {isProsessing ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <ArrowRightIcon />
        )}
        Load Domains
      </Button>
      <pre className="text-sm overflow-auto mt-4">
        <code>{JSON.stringify(domains, null, 2)}</code>
      </pre>
    </div>
  );
}

function PlaygroundPrivy() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  return (
    <div className="bg-card border p-6 rounded-xl">
      <h2 className="text-2xl font-bold">Privy</h2>
      <pre className="text-sm overflow-auto mt-4">
        <code>{JSON.stringify({ user, wallets }, null, 2)}</code>
      </pre>
    </div>
  );
}
