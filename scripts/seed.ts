import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  // Create default admin via Supabase Auth
  const adminEmail = 'universalbatterieshyd@gmail.com'
  const { error: adminError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: 'admin123',
    email_confirm: true,
  })
  if (adminError) {
    if (adminError.message?.includes('already been registered')) {
      console.log('Admin user already exists')
    } else {
      console.error('Admin seed error:', adminError)
    }
  } else {
    console.log(`Created admin: ${adminEmail} / admin123`)
  }

  // Ensure site settings exist
  const settings = [
    { key: 'phone', value: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+91 9391026003' },
    { key: 'whatsapp', value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919391026003' },
    { key: 'email', value: process.env.CONTACT_EMAIL || 'universalbatterieshyd@gmail.com' },
    { key: 'address', value: '2-4-78, M.G. Road, Secunderabad - 500003' },
    { key: 'gst', value: '' },
    { key: 'hours', value: 'Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM' },
    { key: 'site_url', value: process.env.NEXT_PUBLIC_SITE_URL || 'https://universalbatteries.co.in' },
  ]
  for (const s of settings) {
    await supabase.from('site_settings').upsert(
      { key: s.key, value: s.value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  }
  console.log('Updated site settings')

  // Create product categories if empty
  const { data: existingCategories } = await supabase.from('product_category').select('id')
  if (!existingCategories?.length) {
    const categories = [
      { name: 'Automotive Batteries', slug: 'automotive', order: 0 },
      { name: 'Power Backup & UPS', slug: 'ups', order: 1 },
      { name: 'Installation Services', slug: 'installation', order: 2 },
      { name: 'Reseller & Bulk', slug: 'reseller', order: 3 },
    ]
    for (const c of categories) {
      await supabase.from('product_category').insert(c)
    }
    console.log('Created product categories')
  }

  // Create sample branch if empty
  const { data: existingBranches } = await supabase.from('branch').select('id')
  if (!existingBranches?.length) {
    await supabase.from('branch').insert({
      name: 'Main Branch',
      address: 'Hyderabad, Telangana',
      phone: '+91 9391026003',
      hours: 'Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM',
      manager: 'Mr. Suresh Gera',
      is_main: true,
      order: 0,
    })
    console.log('Created Main Branch')
  }

  // Create sample testimonial if empty
  const { data: existingTestimonials } = await supabase.from('testimonial').select('id')
  if (!existingTestimonials?.length) {
    await supabase.from('testimonial').insert({
      quote: 'Universal Batteries has been our trusted supplier for over 15 years. Genuine products and excellent service.',
      role: 'Automobile Workshop Owner',
      area: 'Secunderabad',
      rating: 5,
      is_approved: true,
    })
    console.log('Created sample testimonial')
  }

  console.log('Seed complete!')
}

seed().catch(console.error)
