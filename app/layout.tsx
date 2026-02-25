import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = settings.favicon_url || "/favicon.svg";
  return {
    title: "Universal Batteries - Powering Hyderabad",
    description: "Automotive | Inverter | Solar | Industrial battery solutions.",
    keywords: "batteries Hyderabad, automotive batteries, UPS Hyderabad, inverter batteries",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteSettingsProvider initialSettings={settings}>
          <ClientProviders>{children}</ClientProviders>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
