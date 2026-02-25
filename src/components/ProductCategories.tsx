import { Car, Zap, Server, Sun, Battery, Wrench } from "lucide-react";

const ProductCategories = () => {
  const categories = [
    {
      icon: Car,
      title: "Automotive Batteries",
      description: "Premium car, truck, and commercial vehicle batteries",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Zap,
      title: "Inverter Batteries",
      description: "Long-lasting power backup solutions for homes",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Server,
      title: "UPS Systems",
      description: "Reliable uninterruptible power supply systems",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Sun,
      title: "Solar Solutions",
      description: "Complete solar systems and battery banks",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Battery,
      title: "Lithium & EV",
      description: "Advanced lithium-ion and electric vehicle batteries",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Wrench,
      title: "Accessories",
      description: "Chargers, testers, and battery accessories",
      gradient: "from-secondary/20 to-secondary/5"
    }
  ];

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
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-muted-foreground">
                  {category.description}
                </p>

                <div className="mt-6 text-primary font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                  Explore →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
