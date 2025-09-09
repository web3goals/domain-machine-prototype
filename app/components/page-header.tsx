import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";

export default function PageHeader(props: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  const renderIcon = () => {
    if (isValidElement(props.icon)) {
      // Clone the icon element and add the required className
      return cloneElement(props.icon as ReactElement<{ className?: string }>, {
        className: "size-12 text-primary-foreground",
      });
    }
    // Fallback if icon is not a valid React element
    return props.icon;
  };

  return (
    <div className="flex flex-row items-center gap-4">
      {/* Icon */}
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        {renderIcon()}
      </div>
      {/* Title, subtitle */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
          {props.title}
        </h1>
        <p className="text-muted-foreground mt-1">{props.subtitle}</p>
      </div>
    </div>
  );
}
