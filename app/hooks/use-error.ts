import { errorToString } from "@/lib/converters";
import { toast } from "sonner";

export default function useError() {
  const handleError = async (
    error: unknown,
    message?: string,
    disableToast?: boolean
  ) => {
    // Print error
    console.error(errorToString(error));
    // Display toast
    if (!disableToast) {
      toast.error("Something went wrong :(", {
        description: message || errorToString(error),
      });
    }
  };

  return {
    handleError,
  };
}
