import { BoxesIcon } from "lucide-react";
import PageHeader from "../page-header";
import { Separator } from "../ui/separator";
import { useWallets } from "@privy-io/react-auth";
import useError from "@/hooks/use-error";
import { useEffect, useState } from "react";
import { Listing } from "@/mongodb/models/listing";
import axios from "axios";
import EntityList from "../entity-list";
import { ListingCard } from "./listing-card";

export default function ListingsBought() {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [listings, setListings] = useState<Listing[] | undefined>();

  async function loadListings() {
    try {
      console.log("Loading listings...");

      const wallet = wallets[0];
      if (!wallet) {
        return;
      }

      const { data } = await axios.get("/api/listings", {
        params: { buyerAddress: wallet.address },
      });

      setListings(data.data.listings);
    } catch (error) {
      handleError(error, "Failed to load listings, try again later");
    }
  }

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets]);

  return (
    <div className="container mx-auto px-4 lg:px-40 xl:px-80 py-16">
      <PageHeader
        icon={<BoxesIcon />}
        title="Bought domains"
        subtitle="Keep track of all the domains you've bought"
      />
      <Separator className="my-8" />
      <EntityList<Listing>
        entities={listings}
        renderEntityCard={(listing) => (
          <ListingCard
            key={listing._id!.toString()}
            listing={listing}
            onUpdate={() => loadListings()}
          />
        )}
        noEntitiesText="No listings bought yet"
        className="mt-8"
      />
    </div>
  );
}
