export const dynamic = 'force-dynamic'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { CompanyProfileManager } from '@/components/admin/CompanyProfileManager'
import { getCompanyProfileOverrides, getResolvedCompanyProfile } from '@/lib/company-profile-data'

export default async function CompanyProfileAdminPage() {
  const [overrides, resolved] = await Promise.all([
    getCompanyProfileOverrides(),
    getResolvedCompanyProfile(),
  ])

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Company Profile"
        description="Manage the /profile page used for QR business cards. Contact details and branches are shared with the rest of the site."
      />
      <div className="p-6 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CompanyProfileManager
            initialProfile={overrides}
            shared={{
              phone: resolved.deskPhoneDisplay,
              whatsapp: resolved.whatsappNumber,
              email: resolved.email,
              gst: resolved.gstin,
              websiteUrl: resolved.websiteUrl,
              logoUrl: resolved.logoUrl,
              branches: resolved.branches.map((b) => ({
                name: b.name,
                address: b.address,
                hours: b.hours,
                mapsUrl: b.mapsUrl,
                isMain: b.isMain,
              })),
            }}
          />
        </div>
      </div>
    </div>
  )
}
