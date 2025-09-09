import useError from "@/hooks/use-error";
import { Domain } from "@/types/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import PageHeader from "../page-header";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

export default function ListingCreate() {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const [domains, setDomains] = useState<Domain[] | undefined>(undefined);

  useEffect(() => {
    console.log("Loading domains...");

    const wallet = wallets[0];
    if (!wallet) {
      return;
    }

    const query = `
query {
  names(
    take: 50
    ownedBy: ["eip155:97476:${wallet.address}"]
    networkIds: ["eip155:97476"]
  ) {
    items {
      name
      tokens {
        tokenId
        tokenAddress
        ownerAddress
        networkId
      }
    }
    totalCount
  }
}
      `;

    axios
      .post(
        "https://api-testnet.doma.xyz/graphql",
        { query: query },
        {
          headers: {
            "API-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY,
          },
        }
      )
      .then(({ data }) => {
        const domains: Domain[] = [];
        for (const item of data.data.names.items) {
          for (const token of item.tokens) {
            domains.push({
              name: item.name,
              tokenId: token.tokenId,
              tokenAddress: token.tokenAddress,
              ownerAddress: token.ownerAddress,
              networkId: token.networkId,
            });
          }
        }
        setDomains(domains);
      })
      .catch((error) =>
        handleError(error, "Failed to load domains, try again later")
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets]);

  return (
    <div className="container mx-auto px-4 lg:px-80 py-16">
      <PageHeader
        icon={<PlusIcon />}
        title="List domain"
        subtitle="Select a domain for sale"
      />
      <Separator className="my-8" />
      {domains ? (
        <ListingCreateForm domains={domains} />
      ) : (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      )}
    </div>
  );
}

function ListingCreateForm(props: { domains: Domain[] }) {
  const { wallets } = useWallets();
  const { handleError } = useError();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const formSchema = z.object({
    name: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Listing a domain...");
      setIsProcessing(true);

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("Wallet undefined");
      }

      const domain = props.domains.find((d) => d.name === values.name);
      await axios.post("/api/listings", {
        creatorAddress: wallet.address,
        domain,
      });

      toast.success("Domain listed successfully!");
      router.push(`/listings/created`);
    } catch (error) {
      handleError(error, "Failed to list a domain, try again later");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {props.domains.map((domain) => (
                    <FormItem
                      key={domain.name}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={domain.name} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {domain.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default">
          {isProcessing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowRightIcon />
          )}{" "}
          List Domain
        </Button>
      </form>
    </Form>
  );
}
