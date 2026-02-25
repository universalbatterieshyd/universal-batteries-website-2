import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

type HeroData = {
  headline: string;
  subheadline: string | null;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  background_image_url: string | null;
  tagline: string | null;
} | null;

const DEFAULT_HEADLINE = "Powering Homes, Businesses & Industries";
const DEFAULT_SUBHEADLINE = "Your trusted partner for genuine batteries, expert service, and reliable power solutions across Hyderabad for over 50 years.";
const DEFAULT_CTA_PRIMARY = "WhatsApp Us";
const DEFAULT_CTA_SECONDARY = "Call: +91 9391026003";

const Hero = ({ heroData }: { heroData?: HeroData }) => {
  const headline = heroData?.headline ?? DEFAULT_HEADLINE;
  const subheadline = heroData?.subheadline ?? DEFAULT_SUBHEADLINE;
  const ctaPrimaryText = heroData?.cta_primary_text ?? DEFAULT_CTA_PRIMARY;
  const ctaPrimaryLink = heroData?.cta_primary_link ?? "https://wa.me/919391026003";
  const ctaSecondaryText = heroData?.cta_secondary_text ?? DEFAULT_CTA_SECONDARY;
  const ctaSecondaryLink = heroData?.cta_secondary_link ?? "tel:+919391026003";
  const bgImage = heroData?.background_image_url ?? "/placeholder.svg";

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-start md:items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Universal Batteries warehouse" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 pt-10 md:pt-0 pb-24 md:pb-0 relative z-10 w-full">
        <div className="max-w-3xl animate-fade-in">
          {heroData?.tagline && (
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-background/20 backdrop-blur-sm rounded-full text-primary-foreground text-sm font-medium border border-white/20">
                {heroData.tagline}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            {headline}
          </h1>
          
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href={ctaPrimaryLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                {ctaPrimaryText}
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="bg-white/10 hover:bg-white/20 text-primary-foreground border-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <Link href={ctaSecondaryLink}>
                <Phone className="mr-2 h-5 w-5" />
                {ctaSecondaryText}
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "25+ Years", sublabel: "Experience" },
              { label: "Pan-Hyderabad", sublabel: "Delivery" },
              { label: "Authorized", sublabel: "Multi-Brand" },
              { label: "Same Day", sublabel: "Service" }
            ].map((badge, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg text-center transition-transform duration-300 bg-primary/95 backdrop-blur-sm border border-white/20 hover:scale-[1.02] min-h-[80px] flex flex-col justify-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-base md:text-lg font-semibold text-primary-foreground leading-tight">{badge.label}</div>
                <div className="text-xs md:text-sm text-primary-foreground/90 mt-0.5">{badge.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements - shorter on mobile to avoid overlapping trust badges */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
