"use client";

import { Battery, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";

const Footer = () => {
  const settings = useSiteSettings();
  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "Services", href: "#services" },
    { label: "About Us", href: "#about" }
  ];

  const productCategories = [
    "Automotive Batteries",
    "Inverter Batteries",
    "UPS Systems",
    "Solar Solutions"
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Battery className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xl font-bold">Universal Batteries</div>
                <div className="text-xs opacity-80">Since 1971</div>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-6">
              Your trusted partner for genuine batteries and power solutions across Hyderabad for over 50 years.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="opacity-80 hover:opacity-100 transition-opacity">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Products</h3>
            <ul className="space-y-3">
              {productCategories.map((product) => (
                <li key={product}>
                  <a href="#products" className="opacity-80 hover:opacity-100 transition-opacity">
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1 opacity-80" />
                <span className="opacity-80 text-sm">{settings.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 opacity-80 flex-shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="opacity-80 hover:opacity-100 text-sm transition-opacity">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 opacity-80 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="opacity-80 hover:opacity-100 text-sm transition-opacity">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm opacity-80">
              © {new Date().getFullYear()} Universal Batteries. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                Warranty
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
