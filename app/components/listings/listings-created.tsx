import useError from "@/hooks/use-error";
import { Listing } from "@/mongodb/models/listing";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { AlignJustifyIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import EntityList from "../entity-list";
import PageHeader from "../page-header";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ListingCard } from "./listing-card";

export default function ListingsCreated() {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [listings, setListings] = useState<Listing[] | undefined>();

  useEffect(() => {
    console.log("Loading listings...");

    const wallet = wallets[0];
    if (!wallet) {
      return;
    }

    axios
      .get("/api/listings", { params: { creatorAddress: wallet.address } })
      .then(({ data }) => setListings(data.data.listings))
      .catch((error) =>
        handleError(error, "Failed to load listings, try again later")
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets]);

  return (
    <div className="container mx-auto px-4 lg:px-80 py-16">
      <PageHeader
        icon={<AlignJustifyIcon />}
        title="Listed domains"
        subtitle="Manage all the domains you’ve listed for sale"
      />
      <Separator className="my-8" />
      <Link href="/listings/create">
        <Button>
          <PlusIcon /> List Domain
        </Button>
      </Link>
      <EntityList<Listing>
        entities={listings}
        renderEntityCard={(listing) => (
          <ListingCard key={listing._id!.toString()} listing={listing} />
        )}
        noEntitiesText="No listings created yet"
        className="mt-8"
      />
    </div>
  );
}
