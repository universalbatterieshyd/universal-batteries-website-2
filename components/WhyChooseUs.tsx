import { Shield, Truck, Award, Headphones, ThumbsUp, Clock } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Truck,
  Award,
  Headphones,
  ThumbsUp,
  Clock,
};

type WhyChooseUsProps = {
  config?: { items?: { title: string; description: string; icon: string }[] } | null;
};

const WhyChooseUs = ({ config }: WhyChooseUsProps) => {
  const items = config?.items ?? [];
  const count = items.length;
  const cols = count === 4 ? 2 : count === 6 ? 3 : count <= 3 ? count : 3;
  const gridClass = count === 4
    ? "grid-cols-1 md:grid-cols-2"
    : count === 6
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-20 bg-background" id="about">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Universal Batteries?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for reliable power solutions with unmatched service quality
          </p>
        </div>

        {items.length > 0 ? (
          <div className={`grid ${gridClass} gap-8`}>
            {items.map((item, index) => {
              const Icon = ICON_MAP[item.icon] ?? Shield;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-muted/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Add USPs in Admin → Why Choose Us.
          </p>
        )}
      </div>
    </section>
  );
};

export default WhyChooseUs;
