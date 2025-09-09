import { usePrivy } from "@privy-io/react-auth";
import { LogInIcon } from "lucide-react";
import PageHeader from "./page-header";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function Login() {
  const { login } = usePrivy();

  return (
    <div className="container mx-auto px-4 lg:px-80 py-16">
      <PageHeader
        icon={<LogInIcon />}
        title="Login"
        subtitle="Please login to continue"
      />
      <Separator className="my-8" />
      <Button onClick={() => login()}>
        <LogInIcon /> Login
      </Button>
    </div>
  );
}
