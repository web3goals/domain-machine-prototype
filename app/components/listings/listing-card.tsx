import { Listing } from "@/mongodb/models/listing";
import { useWallets } from "@privy-io/react-auth";
import { CalendarIcon, ExternalLink, StarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function ListingCard(props: { listing: Listing }) {
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
          <ListingCardCreatedAt listing={props.listing} />
          <ListingCardBoughtAt listing={props.listing} />
          <ListingCardScore listing={props.listing} />
          <ListingCardStatus />
          <Separator className="my-2" />
          <ListingCardActions listing={props.listing} />
        </div>
      </div>
    </div>
  );
}

function ListingCardCreatedAt(props: { listing: Listing }) {
  const { wallets } = useWallets();

  if (wallets[0] && wallets[0].address === props.listing.creatorAddress) {
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

function ListingCardBoughtAt(props: { listing: Listing }) {
  const { wallets } = useWallets();

  if (
    wallets[0] &&
    wallets[0].address === props.listing.buyerAddress &&
    props.listing.boughtAt
  ) {
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

// TODO: Implement
function ListingCardStatus() {
  return <></>;
}

// TODO: Implement
function ListingCardActions(props: { listing: Listing }) {
  return (
    <div className="flex flex-row gap-4">
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
