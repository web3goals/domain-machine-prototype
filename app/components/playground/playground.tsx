import { JoystickIcon } from "lucide-react";
import PageHeader from "../page-header";
import { Separator } from "../ui/separator";
import PlaygroundDomains from "./playground-domains";
import PlaygroundPrivy from "./playground-privy";
import PlaygroundSeaportActions from "./playground-seaport-actions";

export default function Playground() {
  return (
    <div className="container mx-auto px-4 lg:px-80 py-16">
      <PageHeader
        icon={<JoystickIcon />}
        title="Playground"
        subtitle="Experiment with different features"
      />
      <Separator className="my-8" />
      <div className="flex flex-col gap-4">
        <PlaygroundSeaportActions />
        <PlaygroundDomains />
        <PlaygroundPrivy />
      </div>
    </div>
  );
}
