import Link from "next/link";
import { DEFAULT_CATEGORY_CARD_IMAGES, DEFAULT_HERO_BACKGROUND } from "@/lib/default-images";

type HeroCategory = {
  id: string;
  name: string;
  slug: string;
  card_image_url?: string | null;
};

type HeroData = {
  headline: string;
  subheadline: string | null;
  background_image_url: string | null;
  tagline: string | null;
} | null;

const DEFAULT_HEADLINE = "Powering Homes, Businesses & Industries";
const DEFAULT_SUBHEADLINE =
  "Your trusted partner for genuine batteries, expert service, and reliable power solutions across Hyderabad for over 30 years.";

function resolveCategoryImage(category: HeroCategory): string | null {
  const fromCms = category.card_image_url?.trim();
  if (fromCms) return fromCms;
  return DEFAULT_CATEGORY_CARD_IMAGES[category.slug] || null;
}

type HeroProps = {
  heroData?: HeroData;
  categories?: HeroCategory[];
};

const Hero = ({ heroData, categories = [] }: HeroProps) => {
  const headline = heroData?.headline ?? DEFAULT_HEADLINE;
  const subheadline = heroData?.subheadline ?? DEFAULT_SUBHEADLINE;
  const backgroundUrl = heroData?.background_image_url?.trim() || DEFAULT_HERO_BACKGROUND;
  const hasBgImage = Boolean(backgroundUrl);
  const tagline = heroData?.tagline ?? "Since 1992 • Trusted Power Solutions";
  const count = categories.length;

  return (
    <section id="home" className="relative min-h-[600px] md:min-h-[720px] flex items-start">
      {/* Background clipped separately so content is never cut off */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hasBgImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundUrl}
              alt="Universal Batteries warehouse"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-hero opacity-90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80" />
        )}
      </div>

      <div className="container mx-auto px-6 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-20 md:pb-16 relative z-10 w-full">
        <div className="animate-fade-in">
          {tagline && (
            <div className="mb-5 md:mb-6">
              <span className="inline-block px-4 py-2 bg-background/20 backdrop-blur-sm rounded-full text-primary-foreground text-sm font-medium border border-white/20">
                {tagline}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-5 md:mb-6 leading-tight max-w-5xl">
            {headline}
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 md:mb-10 max-w-2xl">
            {subheadline}
          </p>

          {count > 0 && (
            <div
              id="products"
              className="scroll-mt-28 -mx-6 px-6 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible sm:max-w-6xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((category, index) => {
                const imageUrl = resolveCategoryImage(category);
                return (
                  <Link
                    key={category.id || category.slug}
                    href={`/categories/${category.slug}`}
                    aria-label={category.name}
                    className="group relative shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-auto sm:min-w-0 aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl overflow-hidden snap-center sm:snap-align-none animate-fade-in transition-transform duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{
                      animationDelay: `${index * 90}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    {imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/70" />
                      </>
                    ) : (
                      <span className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" />
                    )}

                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 transition-[box-shadow,ring-color] duration-500 group-hover:ring-white/35 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />

                    <span className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                      <span className="block text-base sm:text-lg font-semibold text-white leading-snug tracking-tight drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
                        {category.name}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;
