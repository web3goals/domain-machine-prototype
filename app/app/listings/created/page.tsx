"use client";

import ListingsCreated from "@/components/listings/listings-created";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function ListingsCreatedPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <ListingsCreated />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
