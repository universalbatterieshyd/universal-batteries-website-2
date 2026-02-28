import Link from "next/link";
import { Package, Home, Building2, Battery } from "lucide-react";

type HeroData = {
  headline: string;
  subheadline: string | null;
  background_image_url: string | null;
  tagline: string | null;
} | null;

const DEFAULT_HEADLINE = "Powering Homes, Businesses & Industries";
const DEFAULT_SUBHEADLINE = "Your trusted partner for genuine batteries, expert service, and reliable power solutions across Hyderabad for over 30 years.";

const CTA_CHIPS = [
  { label: "Need home backup or solar?", href: "/solutions/home-backup", icon: Home },
  { label: "Running an office, clinic or datacentre?", href: "/solutions/office-ups", icon: Building2 },
  { label: "Looking for a battery replacement?", href: "/solutions/home-backup#battery-finder", icon: Battery },
  { label: "View Products", href: "/#products", icon: Package },
];

const Hero = ({ heroData }: { heroData?: HeroData }) => {
  const headline = heroData?.headline ?? DEFAULT_HEADLINE;
  let subheadline = heroData?.subheadline ?? DEFAULT_SUBHEADLINE;
  if (subheadline?.includes("50 years")) subheadline = subheadline.replace("50 years", "30 years");
  const hasBgImage = Boolean(heroData?.background_image_url?.trim());
  const tagline = (heroData?.tagline ?? "Since 1992 • Trusted Power Solutions").replace("1971", "1992");

  return (
    <section id="home" className="relative min-h-[600px] md:min-h-[700px] flex items-start md:items-center overflow-hidden">
      {/* Background: image if set, else gradient only (no placeholder) */}
      <div className="absolute inset-0 z-0">
        {hasBgImage && (
          <>
            <img 
              src={heroData!.background_image_url!} 
              alt="Universal Batteries warehouse" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-hero opacity-90" />
          </>
        )}
        {!hasBgImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80" />
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 pt-10 md:pt-0 pb-24 md:pb-0 relative z-10 w-full">
        <div className="max-w-5xl animate-fade-in">
          {tagline && (
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-background/20 backdrop-blur-sm rounded-full text-primary-foreground text-sm font-medium border border-white/20">
                {tagline}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            {headline}
          </h1>
          
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-10 max-w-2xl">
            {subheadline}
          </p>

          {/* CTA chips - uniform, link to sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {CTA_CHIPS.map((chip, index) => {
              const Icon = chip.icon;
              return (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="group relative p-5 rounded-xl text-center min-h-[88px] flex flex-col items-center justify-center gap-2 bg-primary/95 backdrop-blur-sm border border-white/20 overflow-hidden animate-fade-in transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/25 hover:border-white/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Icon className="h-5 w-5 text-primary-foreground/90 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm md:text-base font-semibold text-primary-foreground leading-tight relative z-10 group-hover:text-white transition-colors duration-300">
                    {chip.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
