"use client";
import { useState } from "react";
import { Menu, X, Battery } from "lucide-react";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const settings = useSiteSettings();
  const isDark = resolvedTheme === "dark";
  const logoUrl = isDark ? (settings.logo_dark_horizontal || settings.logo_url) : (settings.logo_light_horizontal || settings.logo_url);
  const hasLogo = Boolean(logoUrl?.trim());

  const navItems = [
    { label: "Home", href: "/#home" },
    { label: "Products", href: "/#products" },
    { label: "Solutions", href: "/solutions" },
    { label: "Resources", href: "/resources" },
    { label: "Support", href: "/support" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/#home" className="flex items-center space-x-3">
            {hasLogo ? (
              <img
                src={logoUrl}
                alt="Universal Batteries"
                className="h-12 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Battery className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">Universal Batteries</div>
                  <div className="text-xs text-muted-foreground">Since 1992</div>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
