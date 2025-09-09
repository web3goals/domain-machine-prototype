import { DevIndicator } from "@/components/dev-indicator";
import PrivyProvider from "@/components/privy-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header.tsx";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Fira_Code, Outfit } from "next/font/google";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.description}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `min-h-screen bg-background font-sans antialiased`,
          outfit.variable,
          firaCode.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProvider>
            <div className="relative flex flex-col min-h-screen">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
              <Toaster />
            </div>
            <DevIndicator />
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
