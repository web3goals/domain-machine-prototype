import useError from "@/hooks/use-error";
import { Box } from "@/mongodb/models/box";
import { Listing } from "@/mongodb/models/listing";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { DollarSignIcon, GiftIcon, Loader2Icon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";

export default function BoxBuyBoxBuy(props: {
  onBuyBox: (box: Box, listing: Listing) => void;
}) {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleBuyBox() {
    try {
      console.log("Buying box...");
      setIsProcessing(true);

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("Wallet undefined");
      }

      // TODO: Implement
      // Use contract to pay for a mystery box
      const txHash = "0x0";

      // Create a mystery box with a random listing
      const { data } = await axios.post("/api/boxes", {
        txHash,
        creatorAddress: wallet.address,
      });
      const box = data.data.box;
      const listing = data.data.listing;

      props.onBuyBox(box, listing);
    } catch (error) {
      handleError(error, "Failed to buy a mystery box, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 lg:min-h-[64vh]">
        {/* Left part */}
        <div className="lg:max-w-xl">
          <Image
            src="/images/box-closed.png"
            alt="Closed box"
            priority={false}
            width="100"
            height="100"
            sizes="100vw"
            className="w-full rounded-xl"
          />
        </div>
        {/* Right part */}
        <div className="lg:max-w-md">
          {/* Title, subtitle */}
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter">
            Buy mystery box
          </h1>
          <p className="font-medium tracking-tight text-muted-foreground mt-2">
            Purchase a mystery box to reveal a random domain
          </p>
          {/* Score */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <StarIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-sm">From 0-100</p>
              <p className="text-sm text-muted-foreground">
                Moz DA, Ahrefs DR, Semrush Authority
              </p>
            </div>
          </div>
          {/* Price */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <DollarSignIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-sm">0.025 WETH to open a mystery box</p>
              <p className="text-sm">
                0.01 WETH to buy a domain if you like it
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row gap-2 mt-8">
            <Button disabled={isProcessing} onClick={handleBuyBox}>
              {isProcessing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <GiftIcon />
              )}{" "}
              Buy Mystery Box
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
