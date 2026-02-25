import { Shield, Truck, Award, Headphones, ThumbsUp, Clock } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Genuine Products",
      description: "100% authentic batteries from authorized brands"
    },
    {
      icon: Truck,
      title: "Same Day Delivery",
      description: "Fast delivery across Hyderabad & surrounding areas"
    },
    {
      icon: Award,
      title: "25+ Years Experience",
      description: "Trusted by thousands since 1971"
    },
    {
      icon: Headphones,
      title: "Expert Guidance",
      description: "Professional consultation for the right solution"
    },
    {
      icon: ThumbsUp,
      title: "Free Installation",
      description: "Complimentary setup with every purchase*"
    },
    {
      icon: Clock,
      title: "Quick Service",
      description: "Efficient testing, charging & repair services"
    }
  ];

  return (
    <section className="py-20 bg-background" id="services">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Universal Batteries?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for reliable power solutions with unmatched service quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-muted/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
