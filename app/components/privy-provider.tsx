"use client";

import { PrivyProvider as PP } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PP appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string} config={{}}>
      {children}
    </PP>
  );
}
