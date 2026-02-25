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

const DEFAULT_CATEGORIES = [
  { slug: "automotive", name: "Automotive Batteries", description: "Premium car, truck, and commercial vehicle batteries", icon: "Car", gradient: "from-primary/20 to-primary/5" },
  { slug: "inverter", name: "Inverter Batteries", description: "Long-lasting power backup solutions for homes", icon: "Zap", gradient: "from-secondary/20 to-secondary/5" },
  { slug: "ups", name: "UPS Systems", description: "Reliable uninterruptible power supply systems", icon: "Server", gradient: "from-primary/20 to-primary/5" },
  { slug: "solar", name: "Solar Solutions", description: "Complete solar systems and battery banks", icon: "Sun", gradient: "from-secondary/20 to-secondary/5" },
  { slug: "lithium-ev", name: "Lithium & EV", description: "Advanced lithium-ion and electric vehicle batteries", icon: "Battery", gradient: "from-primary/20 to-primary/5" },
  { slug: "accessories", name: "Accessories", description: "Chargers, testers, and battery accessories", icon: "Wrench", gradient: "from-secondary/20 to-secondary/5" },
];

type CategoryConfig = {
  categories?: { id: string; name: string; slug: string; description?: string | null; icon?: string | null }[];
};

const ProductCategories = ({ config }: { config?: CategoryConfig | null }) => {
  const dbCategories = config?.categories;
  const categories = dbCategories?.length
    ? dbCategories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description ?? "",
        icon: c.icon ?? "Battery",
        gradient: "from-primary/20 to-primary/5",
      }))
    : DEFAULT_CATEGORIES;

  return (
    <section className="py-20 gradient-subtle" id="products">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Complete Power Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive range of genuine batteries and power systems for every need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = ICON_MAP[category.icon] ?? Battery;
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>

                <p className="text-muted-foreground">
                  {category.description}
                </p>

                <div className="mt-6 text-primary font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                  Explore →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
