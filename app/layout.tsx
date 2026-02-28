import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = settings.favicon_url || "/favicon.svg";
  const siteUrl = settings.site_url || "https://universalbatteries.co.in";
  const title = "Universal Batteries | Automotive, Inverter, UPS Hyderabad | Since 1992";
  const description =
    "Genuine batteries & power solutions in Hyderabad. Automotive, inverter, UPS, solar. 30+ years, same-day delivery. Secunderabad.";
  const keywords =
    "batteries Hyderabad, automotive batteries, inverter battery Secunderabad, car battery replacement Hyderabad, UPS Hyderabad, solar batteries";
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Universal Batteries",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

function LocalBusinessJsonLd({ settings }: { settings: { site_url?: string; address?: string; phone?: string; email?: string; hours?: string } }) {
  const siteUrl = settings.site_url || "https://universalbatteries.co.in";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Universal Batteries",
    description: "Genuine batteries and power solutions in Hyderabad since 1992. Automotive, inverter, UPS, solar.",
    url: siteUrl,
    telephone: settings.phone?.replace(/\s/g, "") || "",
    email: settings.email || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || "2-4-78, M.G. Road",
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500003",
    },
    openingHoursSpecification: settings.hours
      ? { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" }
      : undefined,
    foundingDate: "1992",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
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
        <LocalBusinessJsonLd settings={settings} />
        <SiteSettingsProvider initialSettings={settings}>
          <ClientProviders>{children}</ClientProviders>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
