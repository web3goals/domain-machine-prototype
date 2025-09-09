"use client";

import BoxBuy from "@/components/boxes/box-buy";
import { Loading } from "@/components/loading";
import { Login } from "@/components/login";
import { usePrivy } from "@privy-io/react-auth";

export default function BoxBuyPage() {
  const { ready, authenticated } = usePrivy();

  if (ready && authenticated) {
    return <BoxBuy />;
  }

  if (ready && !authenticated) {
    return <Login />;
  }

  return <Loading />;
}
