import { Listing } from "@/mongodb/models/listing";
import { useWallets } from "@privy-io/react-auth";
import {
  CalendarIcon,
  CheckIcon,
  ExternalLink,
  InfoIcon,
  Loader2Icon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import useError from "@/hooks/use-error";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatEther } from "viem";
import { chainConfig } from "@/config/chain";

export function ListingCard(props: { listing: Listing; onUpdate: () => void }) {
  const { wallets } = useWallets();

  const isSeller =
    wallets[0] && wallets[0].address === props.listing.creatorAddress;
  const isBuyer =
    wallets[0] && wallets[0].address === props.listing.buyerAddress;

  return (
    <div className="w-full flex flex-row gap-6 border rounded px-6 py-6">
      {/* Left part */}
      <div className="flex items-center justify-center border rounded-xl size-40 bg-accent">
        <p className="text-xl font-semibold text-accent-foreground">
          {props.listing.domain.name}
        </p>
      </div>
      {/* Right part */}
      <div className="flex-1">
        <div className="flex flex-col gap-4">
          <ListingCardCreatedAt listing={props.listing} isSeller={isSeller} />
          <ListingCardBoughtAt listing={props.listing} isBuyer={isBuyer} />
          <ListingCardScore listing={props.listing} />
          <ListingCardStatus
            listing={props.listing}
            isSeller={isSeller}
            isBuyer={isBuyer}
          />
          <Separator className="my-2" />
          <ListingCardActions
            listing={props.listing}
            isSeller={isSeller}
            onUpdate={props.onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

function ListingCardCreatedAt(props: { listing: Listing; isSeller: boolean }) {
  if (props.isSeller) {
    return (
      <div className="flex flex-row gap-3">
        <div className="flex items-center justify-center size-8 rounded-full bg-primary">
          <CalendarIcon className="size-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Listed</p>
          <p className="text-sm">
            {new Date(props.listing.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return <></>;
}

function ListingCardBoughtAt(props: { listing: Listing; isBuyer: boolean }) {
  if (props.isBuyer && props.listing.boughtAt) {
    return (
      <div className="flex flex-row gap-3">
        <div className="flex items-center justify-center size-8 rounded-full bg-primary">
          <CalendarIcon className="size-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Bought</p>
          <p className="text-sm">
            {new Date(props.listing.boughtAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return <></>;
}

function ListingCardScore(props: { listing: Listing }) {
  return (
    <div className="flex flex-row gap-3">
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
  );
}

function ListingCardStatus(props: {
  listing: Listing;
  isSeller: boolean;
  isBuyer: boolean;
}) {
  return (
    <div className="flex flex-row gap-3">
      <div className="flex items-center justify-center size-8 rounded-full bg-primary">
        <InfoIcon className="size-4 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">Status</p>
        <ListingCardStatusContent
          listing={props.listing}
          isSeller={props.isSeller}
          isBuyer={props.isBuyer}
        />
      </div>
    </div>
  );
}

function ListingCardStatusContent(props: {
  listing: Listing;
  isSeller: boolean;
  isBuyer: boolean;
}) {
  if (props.isSeller && !props.listing.boughtAt) {
    return <p className="text-sm">Waiting for a buyer</p>;
  }

  if (
    props.isSeller &&
    props.listing.boughtAt &&
    !props.listing.buyCompletedAt
  ) {
    return (
      <>
        <p className="text-sm">A buyer has been found</p>
        <p className="text-sm">You need to complete the sale</p>
      </>
    );
  }

  // TODO: Add link to the transactions
  if (
    props.isSeller &&
    props.listing.buyCompletedAt &&
    !props.listing.treasurySharedAt
  ) {
    return (
      <>
        <p className="text-sm">
          Domain sold for {formatEther(BigInt(props.listing.buyValue))}{" "}
          {chainConfig.buyTokenSymbol}
        </p>
        <p className="text-sm">Waiting for the treasure distribution</p>
      </>
    );
  }

  // TODO: Add link to the transactions
  if (
    props.isSeller &&
    props.listing.buyCompletedAt &&
    props.listing.treasurySharedAt
  ) {
    return (
      <>
        <p className="text-sm">
          Domain sold for {formatEther(BigInt(props.listing.buyValue))}{" "}
          {chainConfig.buyTokenSymbol}
        </p>
        <p className="text-sm">
          Treasure share of{" "}
          {formatEther(BigInt(props.listing.treasuryShareValue!))}{" "}
          {chainConfig.buyTokenSymbol} received
        </p>
      </>
    );
  }

  if (props.isBuyer && !props.listing.buyCompletedAt) {
    return (
      <p className="text-sm">Waiting for the seller to complete the sale</p>
    );
  }

  if (props.isBuyer && props.listing.buyCompletedAt) {
    return <p className="text-sm">Sale completed</p>;
  }

  return <p className="text-sm">Unknown</p>;
}

function ListingCardActions(props: {
  listing: Listing;
  isSeller: boolean;
  onUpdate: () => void;
}) {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCompleteSale() {
    try {
      console.log("Completing sale...");
      setIsProcessing(true);

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("Wallet undefined");
      }

      // TODO: Implement
      // Accept the offer using Doma protocol
      const txHash = "0x0";

      // Update listing
      await axios.patch(`/api/listings/${props.listing._id}`, {
        buyCompletedTxHash: txHash,
      });

      toast.success("Sale completed");
      props.onUpdate();
    } catch (error) {
      handleError(error, "Failed to complete the sale, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex flex-row gap-4">
      {props.isSeller &&
        props.listing.boughtAt &&
        !props.listing.buyCompletedAt && (
          <Button disabled={isProcessing} onClick={handleCompleteSale}>
            {isProcessing ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}{" "}
            Complete Sale
          </Button>
        )}
      <Link
        href={`https://dashboard-testnet.doma.xyz/domain/${props.listing.domain.name}`}
        target="_blank"
      >
        <Button variant="secondary">
          <ExternalLink />
          Open Doma
        </Button>
      </Link>
      <Link href="https://testnet.d3.app/" target="_blank">
        <Button variant="secondary">
          <ExternalLink />
          Open D3
        </Button>
      </Link>
    </div>
  );
}
