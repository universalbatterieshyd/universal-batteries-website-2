import Link from "next/link";
import {
  Car,
  Zap,
  Server,
  Sun,
  Battery,
  Wrench,
  Shield,
  Truck,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Car,
  Zap,
  Server,
  Sun,
  Battery,
  Wrench,
  Shield,
  Truck,
};

type CategoryConfig = {
  categories?: { id: string; name: string; slug: string; description?: string | null; icon?: string | null; card_image_url?: string | null }[];
};

const ProductCategories = ({ config }: { config?: CategoryConfig | null }) => {
  const dbCategories = config?.categories ?? [];
  const categories = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    icon: c.icon ?? "Battery",
    cardImageUrl: c.card_image_url ?? null,
    gradient: "from-primary/20 to-primary/5",
  }));

  return (
    <section className="py-12 md:py-20 gradient-subtle" id="products">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Complete Power Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive range of genuine batteries and power systems for every need
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {categories.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No categories yet. Add categories in Admin → Categories.
            </p>
          ) : (
          categories.map((category, index) => {
            const Icon = ICON_MAP[category.icon] ?? Battery;
            const hasImage = Boolean(category.cardImageUrl?.trim());
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group block rounded-xl md:rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image or icon header - distinct from hero chips */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  {hasImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={category.cardImageUrl!}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${category.gradient}`}>
                      <Icon className="w-12 h-12 md:w-16 md:h-16 text-primary/80 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}
                </div>
                {/* Content below image - card style */}
                <div className="p-4 md:p-6">
                  <h3 className="text-sm md:text-xl font-bold text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-base line-clamp-2 md:line-clamp-none">
                    {category.description}
                  </p>
                  <span className="mt-2 md:mt-4 inline-flex items-center gap-1 text-primary font-medium text-xs md:text-base group-hover:gap-2 transition-all">
                    Explore <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
