import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import FeaturesGridSection from "@/components/sections/FeaturesGridSection";
import ImageTextSection from "@/components/sections/ImageTextSection";
import FAQSection from "@/components/sections/FAQSection";
import CTABannerSection from "@/components/sections/CTABannerSection";
import { supabase } from "@/lib/supabase";

type SectionProps = { heroData?: unknown; config?: Record<string, unknown> | null };

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: Hero as React.ComponentType<SectionProps>,
  product_categories: ProductCategories as React.ComponentType<SectionProps>,
  why_choose_us: WhyChooseUs as React.ComponentType<SectionProps>,
  testimonials: Testimonials as React.ComponentType<SectionProps>,
  contact_cta: ContactCTA as React.ComponentType<SectionProps>,
  features_grid: FeaturesGridSection as React.ComponentType<SectionProps>,
  image_text: ImageTextSection as React.ComponentType<SectionProps>,
  faq: FAQSection as React.ComponentType<SectionProps>,
  cta_banner: CTABannerSection as React.ComponentType<SectionProps>,
};

const DEFAULT_SECTION_ORDER = [
  "hero",
  "product_categories",
  "why_choose_us",
  "testimonials",
  "contact_cta",
];

export default async function HomePage() {
  let heroData: unknown = null;
  let sectionRows: { id: string; section_key: string; is_visible: boolean; config?: Record<string, unknown> | null }[] = [];

  let categories: { id: string; name: string; slug: string; description?: string | null; icon?: string | null }[] = [];

  try {
    const [heroRes, sectionsRes, categoriesRes] = await Promise.all([
      supabase
        .from("hero_content")
        .select("*")
        .eq("is_active", true)
        .order("order", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("homepage_sections")
        .select("id, section_key, is_visible, config")
        .order("order", { ascending: true }),
      supabase
        .from("product_category")
        .select("id, name, slug, description, icon")
        .is("parent_id", null)
        .order("order", { ascending: true }),
    ]);
    heroData = heroRes.data ?? null;
    sectionRows = (sectionsRes.data ?? []).filter((s) => s.is_visible);
    categories = (categoriesRes.data ?? []) as { id: string; name: string; slug: string; description?: string | null; icon?: string | null }[];
  } catch {
    // Tables may not exist yet - use defaults
  }

  const visibleSections =
    sectionRows.length > 0
      ? sectionRows
      : DEFAULT_SECTION_ORDER.map((key) => ({
          id: key,
          section_key: key,
          is_visible: true,
          config: null,
        }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {visibleSections.map((section) => {
          const { id, section_key, config } = section;
          const Component = SECTION_COMPONENTS[section_key];
          if (!Component) return null;
          const enrichedConfig =
            section_key === "product_categories"
              ? { ...(config ?? {}), categories }
              : config ?? null;

          return (
            <Component
              key={id}
              heroData={section_key === "hero" ? heroData : undefined}
              config={section_key !== "hero" ? enrichedConfig : undefined}
            />
          );
        })}
      </main>
      <Footer />
    </div>
  );
}
