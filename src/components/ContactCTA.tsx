import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, MapPin, Mail } from "lucide-react";

const ContactCTA = () => {
  return (
    <section className="py-20 bg-background" id="contact">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16">
            {/* Left Side - CTA */}
            <div className="animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Get in Touch with Us Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions? Need a quote? Our team is ready to help you find the perfect power solution.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </div>
            </div>

            {/* Right Side - Contact Info */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Visit Our Store</div>
                  <div className="text-muted-foreground">
                    2-4-78, M.G. Road, Secunderabad - 500003
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Call Us</div>
                  <div className="text-muted-foreground">
                    +91 9391026003
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Email Us</div>
                  <div className="text-muted-foreground">
                    info@universalbatteries.com
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>Working Hours:</strong><br />
                  Mon - Sat: 9:00 AM - 7:00 PM<br />
                  Sunday: 10:00 AM - 5:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
