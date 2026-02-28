"use client";

import { MapPin, Mail, Phone, Headphones } from "lucide-react";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import Link from "next/link";

const ContactCTA = () => {
  const settings = useSiteSettings();

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
              <p className="text-lg text-muted-foreground mb-6">
                Have questions? Need a quote? Our team is ready to help you find the perfect power solution. Use the WhatsApp widget for instant support, or find our contact details below.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <Headphones className="h-4 w-4" />
                Submit a support ticket
              </Link>
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
                    {settings.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Call Us</div>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Email Us</div>
                  <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>Working Hours:</strong><br />
                  {settings.hours.split(", ").map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>
                  ))}
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
