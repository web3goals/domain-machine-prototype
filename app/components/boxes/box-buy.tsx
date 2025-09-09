import { Listing } from "@/mongodb/models/listing";
import { useState } from "react";
import BoxBuyBoxBuy from "./box-buy-box-buy";
import BoxBuyListingBought from "./box-buy-listing-bought";
import BoxBuyListingBuy from "./box-buy-listing-buy";

export default function BoxBuy() {
  const [listing, setListing] = useState<Listing | undefined>();
  const [listingBought, setListingBought] = useState(false);

  if (listingBought) {
    return <BoxBuyListingBought />;
  }

  if (listing) {
    return (
      <BoxBuyListingBuy
        listing={listing}
        onBuyListing={() => setListingBought(true)}
        onSkipListing={() => setListing(undefined)}
      />
    );
  }

  return (
    <BoxBuyBoxBuy
      onBuyBox={(_, listing) => {
        setListing(listing);
      }}
    />
  );
}
