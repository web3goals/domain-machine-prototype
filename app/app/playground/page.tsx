"use client";

import { Separator } from "@/components/ui/separator";
import { usePrivy } from "@privy-io/react-auth";

export default function PlaygroundPage() {
  const { user } = usePrivy();

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tighter">
        Playground page
      </h1>
      <Separator className="my-8" />
      <div>
        <h2 className="text-2xl font-bold">User</h2>
        <pre className="text-sm bg-secondary p-4 rounded-lg overflow-auto mt-2">
          <code>{JSON.stringify(user, null, 2)}</code>
        </pre>
      </div>
    </main>
  );
}
