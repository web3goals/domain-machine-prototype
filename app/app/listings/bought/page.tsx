"use client";

import ListingsBought from "@/components/listings/listings-bought";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function ListingsBoughtPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <ListingsBought />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
