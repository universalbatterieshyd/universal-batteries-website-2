import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  let heroData = null;
  try {
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })
      .limit(1)
      .maybeSingle();
    heroData = data;
  } catch {
    // hero_content table may not exist yet
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <Hero heroData={heroData} />
        <ProductCategories />
        <WhyChooseUs />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
