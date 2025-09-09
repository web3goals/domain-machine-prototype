import { Button } from "@/components/ui/button";
import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { Seaport } from "@opensea/seaport-js";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { ethers } from "ethers";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

export default function PlaygroundSeaportActions() {
  const { handleError } = useError();
  const { wallets } = useWallets();
  const [isProcessing, setIsProcessing] = useState(false);
  const accountOne = "0xcbFb1a51aCf21bdac6F62e41c6DfAd390e6Eb006";
  const accountTwo = "0xf35b5c255FDdF8057B8Df4C59a1FDb81193994dE";

  async function getSeaport(): Promise<Seaport> {
    // Check wallet
    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("Wallet undefined");
    }
    if (
      wallet.chainId.replace("eip155:", "") !== chainConfig.chain.id.toString()
    ) {
      throw new Error("Wrong chain");
    }

    // Create signer
    const provider = await wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Create seaport
    return new Seaport(signer, {
      overrides: {
        contractAddress: chainConfig.seaportContractAddress,
        seaportVersion: chainConfig.seaportVersion,
      },
    });
  }

  // TODO: Approve WETH spending before creating offer
  async function handleCreateOffer() {
    try {
      setIsProcessing(true);
      console.log("Creating offer...");

      const seaport = await getSeaport();
      const order = await seaport.createOrder({
        offer: [
          {
            token: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
            amount: "1500000000000000",
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC721,
            token: "0x424bdf2e8a6f52bd2c1c81d9437b0dc0309df90f",
            identifier:
              "107137215232458749996855170311736713895383956783073784797511084938723223236735",
            recipient: accountTwo,
          },
          {
            token: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
            amount: "7500000000000",
            recipient: "0x2e7cc63800e77bb8c662c45ef33d1ccc23861532",
          },
          {
            token: "0x6f898cd313dcee4d28a87f675bd93c471868b0ac",
            amount: "37500000000000",
            recipient: "0x5318579e61a7a6cd71a8fd163c1a6794b2695e2b",
          },
        ],
        restrictedByZone: true,
        zone: "0xCEF2071b4246DB4D0E076A377348339f31a07dEA",
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(
          new Date(Date.now() + 24 * 60 * 60 * 1000).getTime() / 1000
        ).toString(),
      });

      const executedOrder = await order.executeAllActions();
      console.log({ executedOrder });

      const { data } = await axios.post(
        "https://api-testnet.doma.xyz/v1/orderbook/offer",
        {
          orderbook: "DOMA",
          chainId: "eip155:97476",
          parameters: executedOrder.parameters,
          signature: executedOrder.signature,
        },
        {
          headers: {
            "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY,
          },
        }
      );
      console.log({ data });
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  // TODO: Approve ERC721 transfer before accepting offer
  async function handleAcceptOffer() {
    try {
      setIsProcessing(true);
      console.log("Accepting offer...");

      const seaport = await getSeaport();

      const offerId =
        "0xa997cc958dee60a23b4f94e03909eb171e32960e60d87f6c2c180e8e28523e8d";
      const fulfiller = accountOne;
      const { data } = await axios.get(
        `https://api-testnet.doma.xyz/v1/orderbook/offer/${offerId}/${fulfiller}`,
        {
          headers: {
            "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY,
          },
        }
      );
      console.log({ data });

      const fulfill = await seaport.fulfillOrder({
        order: data.order,
        considerationCriteria: [],
        conduitKey:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        recipientAddress: "0x0000000000000000000000000000000000000000",
        extraData: data.extraData,
        unitsToFill: 1,
      });

      const fulfillTransaction =
        await fulfill.actions[0].transactionMethods.buildTransaction();
      console.log({ fulfillTransaction });

      const txReceipt = await fulfill.executeAllActions();
      console.log("Order fulfilled:", txReceipt);
    } catch (error) {
      handleError(error, "Failed, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-card border p-6 rounded-xl">
      <h2 className="text-2xl font-bold">Seaport Actions</h2>
      <div className="flex flex-row gap-2">
        <Button
          onClick={handleCreateOffer}
          disabled={isProcessing}
          className="mt-4"
        >
          {isProcessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}
          Create Offer
        </Button>
        <Button
          onClick={handleAcceptOffer}
          disabled={isProcessing}
          className="mt-4"
        >
          {isProcessing ? (
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
