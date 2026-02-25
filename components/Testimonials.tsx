import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Secunderabad",
      rating: 5,
      text: "Excellent service and genuine products. They delivered and installed my inverter battery the same day!"
    },
    {
      name: "Priya Sharma",
      location: "Kukatpally",
      rating: 5,
      text: "Very knowledgeable staff. Helped me choose the right battery for my car. Great experience!"
    },
    {
      name: "Mohammed Ali",
      location: "Gachibowli",
      rating: 5,
      text: "Been buying from them for 10+ years. Always reliable, always genuine products."
    }
  ];

  return (
    <section id="testimonials" className="py-20 gradient-subtle">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 dark:text-white">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-gray-300">
            Trusted by thousands of satisfied customers across Hyderabad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-fade-in dark:bg-slate-800/90 dark:border-slate-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 italic dark:text-gray-100">
                "{testimonial.text}"
              </p>
              
              <div>
                <div className="font-bold text-foreground dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground dark:text-gray-300">{testimonial.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
