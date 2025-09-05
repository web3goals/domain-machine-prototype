import { User } from "@privy-io/react-auth";
import { AxiosError } from "axios";

export function addressToShortAddress(
  address: string | undefined
): string | undefined {
  let shortAddress = address;
  if (address && address.length > 10) {
    shortAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }
  return shortAddress?.toLowerCase();
}

export function errorToString(error: unknown): string {
  let message = JSON.stringify(error, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  if (error instanceof Error) {
    message = error.message;
  }
  if (error instanceof AxiosError) {
    message = JSON.stringify({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
  return message;
}

export function privyUserToDisplayName(user: User | null): string | undefined {
  return user?.email?.address || user?.google?.email;
}
