import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function PlaygroundPrivy() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  return (
    <div className="bg-card border p-6 rounded-xl">
      <h2 className="text-2xl font-bold">Privy</h2>
      <pre className="text-sm overflow-auto mt-4">
        <code>{JSON.stringify({ user, wallets }, null, 2)}</code>
      </pre>
    </div>
  );
}
