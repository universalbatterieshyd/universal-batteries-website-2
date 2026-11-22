import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getResolvedCompanyProfile } from '@/lib/company-profile-data'
import { CompanyProfileCard } from '@/components/company-profile/CompanyProfileCard'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getResolvedCompanyProfile()
  return {
    title: `${profile.companyName} · Company Profile`,
    description: profile.tagline,
    robots: { index: false, follow: false },
  }
}

export default async function CompanyProfilePage() {
  const profile = await getResolvedCompanyProfile()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 sm:pb-16">
        <div className="mx-auto w-full max-w-[480px] px-4 sm:px-6">
          <CompanyProfileCard profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
