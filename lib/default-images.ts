/**
 * Local public/images WebP defaults for homepage hero, chips, and category cards.
 * Used when CMS fields are empty so generated assets appear without a DB update.
 */

export const DEFAULT_HERO_BACKGROUND = "/images/hero-homepage.webp";

export const DEFAULT_CHIP_IMAGES: Record<string, string> = {
  "/solutions/home-backup": "/images/chip-home-backup-solar.webp",
  "/solutions/office-ups": "/images/chip-office-ups.webp",
  "/solutions/home-backup#battery-finder": "/images/chip-battery-replacement.webp",
  "/#products": "/images/chip-view-products.webp",
};

export const DEFAULT_CATEGORY_CARD_IMAGES: Record<string, string> = {
  "automotive-batteries": "/images/card-automotive-batteries.webp",
  "power-backup-systems": "/images/card-power-backup.webp",
  "solar-energy-solutions": "/images/card-solar-energy.webp",
  "support-services": "/images/card-support-services.webp",
};
