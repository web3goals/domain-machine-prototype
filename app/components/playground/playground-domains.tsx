import { Button } from "@/components/ui/button";
import useError from "@/hooks/use-error";
import { Domain } from "@/types/domain";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

export default function PlaygroundDomains() {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [domains, setDomains] = useState<Domain[] | undefined>();
  const [isProsessing, setIsProsessing] = useState(false);

  async function handleLoadDomains() {
    try {
      setIsProsessing(true);
      console.log("Load domains...");

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("Wallet undefined");
      }

      const query = `
query {
  names(
    take: 50
    ownedBy: ["eip155:97476:${wallet.address}"]
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
