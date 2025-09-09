"use client";

import CreateListing from "@/components/listings/listing-create";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateListingPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <CreateListing />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
