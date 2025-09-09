"use client";

import CreatedListings from "@/components/listings/listings-created";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function CreatedListingsPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <CreatedListings />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
