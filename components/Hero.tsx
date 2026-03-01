import Link from "next/link";
import { Package, Home, Building2, Battery } from "lucide-react";

const ICON_MAP = { Home, Building2, Battery, Package } as const;

type HeroChip = {
  label: string;
  href: string;
  icon: keyof typeof ICON_MAP;
  image_url?: string | null;
};

type HeroData = {
  headline: string;
  subheadline: string | null;
  background_image_url: string | null;
  tagline: string | null;
  cta_chips?: HeroChip[] | null;
} | null;

const DEFAULT_HEADLINE = "Powering Homes, Businesses & Industries";
const DEFAULT_SUBHEADLINE = "Your trusted partner for genuine batteries, expert service, and reliable power solutions across Hyderabad for over 30 years.";

const DEFAULT_CTA_CHIPS: HeroChip[] = [
  { label: "Need home backup or solar?", href: "/solutions/home-backup", icon: "Home" },
  { label: "Running an office, clinic or datacentre?", href: "/solutions/office-ups", icon: "Building2" },
  { label: "Looking for a battery replacement?", href: "/solutions/home-backup#battery-finder", icon: "Battery" },
  { label: "View Products", href: "/#products", icon: "Package" },
];

const Hero = ({ heroData }: { heroData?: HeroData }) => {
  const headline = heroData?.headline ?? DEFAULT_HEADLINE;
  const subheadline = heroData?.subheadline ?? DEFAULT_SUBHEADLINE;
  const hasBgImage = Boolean(heroData?.background_image_url?.trim());
  const tagline = heroData?.tagline ?? "Since 1992 • Trusted Power Solutions";
  const chips = (heroData?.cta_chips?.length ? heroData.cta_chips : DEFAULT_CTA_CHIPS) as HeroChip[];

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

          {/* CTA chips - square, compact on desktop, optional bg images */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 lg:gap-4 max-w-2xl lg:max-w-3xl">
            {chips.map((chip, index) => {
              const Icon = ICON_MAP[chip.icon] ?? Battery;
              const hasImage = Boolean(chip.image_url?.trim());
              return (
                <Link
                  key={`${chip.href}-${index}`}
                  href={chip.href}
                  className="group relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 overflow-hidden animate-fade-in transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-xl active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: "backwards",
                    background: hasImage ? undefined : "linear-gradient(145deg, hsl(357 82% 52%) 0%, hsl(357 82% 42%) 50%, hsl(357 82% 38%) 100%)",
                    boxShadow: hasImage ? "0 4px 20px -4px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1)" : "0 4px 20px -4px rgba(227,27,35,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Background image (Amazon-style) */}
                  {hasImage && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={chip.image_url!}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30" />
                    </>
                  )}
                  {/* Hover glow (solid bg only) */}
                  {!hasImage && (
                    <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {/* Icon container */}
                  <div className={`relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 transition-all duration-300 ${hasImage ? "bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30 group-hover:scale-110" : "bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25 group-hover:scale-110"}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="relative z-10 text-xs sm:text-sm font-semibold text-white leading-tight text-center line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
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
