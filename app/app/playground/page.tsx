"use client";

import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import Playground from "@/components/playground/playground";
import { usePrivy } from "@privy-io/react-auth";

export default function PlaygroundPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <Playground />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
