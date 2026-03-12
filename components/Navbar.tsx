"use client";
import { useEffect, useState } from "react";
import { Menu, X, Battery } from "lucide-react";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const settings = useSiteSettings();
  const isDark = resolvedTheme === "dark";
  const logoUrl = isDark ? (settings.logo_dark_horizontal || settings.logo_url) : (settings.logo_light_horizontal || settings.logo_url);
  const hasLogo = Boolean(logoUrl?.trim());

  const [productLinks, setProductLinks] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    // Load categories to drive Products submenu dynamically
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories?all=true");
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;

        const topLevel = data.filter((c: { parentId?: string | null }) => !c.parentId);
        setProductLinks(
          topLevel.map((c: { name: string; slug: string }) => ({
            label: c.name,
            href: `/categories/${c.slug}`,
          }))
        );
      } catch {
        // fail silently; fallback nav still works
      }
    };
    loadCategories();
  }, []);

  const navItems: NavItem[] = [
    { label: "Home", href: "/#home" },
    {
      label: "Products",
      href: "/#products",
      submenu: productLinks.length
        ? [
            ...productLinks,
            { label: "View all products", href: "/#products" },
          ]
        : undefined,
    },
    { label: "Solutions", href: "/solutions" },
    {
      label: "Resources",
      href: "/resources",
      submenu: [
        { label: "Guides", href: "/resources" },
        { label: "Articles", href: "/articles" },
      ],
    },
    { label: "Support", href: "/support" },
    { label: "Contact", href: "/#contact" },
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
            {navItems.map((item) =>
              item.submenu ? (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {item.label}
                  </a>
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto hover:opacity-100 hover:pointer-events-auto transition-opacity duration-200 absolute left-0 top-full mt-0.5 min-w-[220px] rounded-xl border border-slate-200 bg-background shadow-lg py-3">
                    {item.submenu.map((sub) => (
                      <a
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-slate-50"
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  {item.label}
                </a>
              )
            )}
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
                <div key={item.label} className="space-y-1">
                  <a
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 font-medium py-2 block"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                  {item.submenu && (
                    <div className="pl-4 space-y-1">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          className="block text-sm text-muted-foreground hover:text-primary py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
