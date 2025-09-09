"use client";

import ListingCreate from "@/components/listings/listing-create";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function ListingCreatePage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <ListingCreate />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
