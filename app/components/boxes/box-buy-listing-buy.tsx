import useError from "@/hooks/use-error";
import { Listing } from "@/mongodb/models/listing";
import {
  CheckIcon,
  DollarSignIcon,
  GlobeIcon,
  Loader2Icon,
  StarIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "../ui/button";

export default function BoxBuyListingBuy(props: {
  listing: Listing;
  onBuyListing: () => void;
  onSkipListing: () => void;
}) {
  const { handleError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleBuyListing() {
    try {
      console.log("Buying listing...");
      setIsProcessing(true);

      // TODO: Implement
      // Create an offer using Doma protocol

      props.onBuyListing();
    } catch (error) {
      handleError(error, "Failed to buy a listing, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSkipListing() {
    console.log("Skipping listing...");
    props.onSkipListing();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 lg:min-h-[64vh]">
        {/* Left part */}
        <div className="lg:max-w-xl">
          <Image
            src="/images/box-opened.png"
            alt="Opened box"
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
            Mystery box is open!
          </h1>
          <p className="font-medium tracking-tight text-muted-foreground mt-2">
            See the domain and its score, then choose whether to buy it
          </p>
          {/* Name */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <GlobeIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Domain</p>
              <p className="text-sm">{props.listing.domain.name}</p>
            </div>
          </div>
          {/* Score */}
          <div className="flex flex-row gap-3 mt-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <StarIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-sm">{props.listing.domainScore.average}</p>
              <p className="text-sm text-muted-foreground">
                Moz DA = {props.listing.domainScore.mozDa}
              </p>
              <p className="text-sm text-muted-foreground">
                Ahrefs DR = {props.listing.domainScore.ahrefsDr}
              </p>
              <p className="text-sm text-muted-foreground">
                Semrush Authority = {props.listing.domainScore.semrushAuthority}
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
              <p className="text-sm">0.01 WETH</p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row gap-2 mt-8">
            <Button disabled={isProcessing} onClick={handleBuyListing}>
              {isProcessing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckIcon />
              )}{" "}
              Buy Domain
            </Button>
            <Button
              variant="secondary"
              disabled={isProcessing}
              onClick={handleSkipListing}
            >
              {isProcessing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <XIcon />
              )}{" "}
              Skip Domain
            </Button>
          </div>
        </div>
      </div>
      <Confetti
        width={document.body.clientWidth}
        height={document.body.scrollHeight}
        recycle={false}
      />
    </div>
  );
}
