import { config } from 'dotenv';
import fetch from 'node-fetch';
import { AHMEDABAD_LOCALITY_DIRECTORY, generateAuthenticProperties } from '../src/data/ahmedabadData';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xbetskuzmtvwlqfkwxb.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QKOOCbRx0PyTloN3GXjdhQ_ZlVZfBJu';

async function run() {
  console.log('🚀 Syncing 200+ Localities & Verified Projects to Supabase REST API...');

  // 1. LOCALITIES
  const localityEntries = Object.values(AHMEDABAD_LOCALITY_DIRECTORY).map((loc) => {
    let zone = 'South & West';
    if (loc.city === 'Gandhinagar') zone = 'Gandhinagar';
    else if (loc.lat > 23.08) zone = 'North Ahmedabad';
    else if (loc.lng > 72.64) zone = 'East Ahmedabad';

    return {
      name: loc.name,
      city: loc.city,
      zone: zone,
      latitude: loc.lat,
      longitude: loc.lng,
      tier: loc.tier,
      avg_price_per_sqft: loc.avgPricePerSqFt,
    };
  });

  const locRes = await fetch(`${supabaseUrl}/rest/v1/localities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(localityEntries)
  });

  if (!locRes.ok) {
    const txt = await locRes.text();
    console.error('❌ Localities sync error:', locRes.status, txt);
  } else {
    console.log(`✅ ${localityEntries.length} Localities successfully synced to Supabase!`);
  }

  // 2. PROJECTS
  const projects = generateAuthenticProperties();
  const projectEntries = projects.map((p) => ({
    name: p.name,
    developer: p.builder?.name || 'Top Developer',
    locality_name: p.locality,
    city: p.city,
    category: p.category,
    price_min_inr: p.priceRangeMinInr,
    price_max_inr: p.priceRangeMaxInr,
    price_per_sqft: p.pricePerSqFt,
    price_per_sqyd: p.pricePerSqYd,
    valuation_tier: p.valuationTier || 'at-avg',
    is_bank_auction: p.isBankAuction || false,
    is_featured: p.isFeatured || false,
    rera_id: p.reraNumber,
    cover_image: p.coverImage,
    latitude: p.coordinates.lat,
    longitude: p.coordinates.lng,
    total_units: p.totalUnits,
  }));

  const projRes = await fetch(`${supabaseUrl}/rest/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(projectEntries)
  });

  if (!projRes.ok) {
    const txt = await projRes.text();
    console.error('❌ Projects sync error:', projRes.status, txt);
  } else {
    console.log(`✅ ${projectEntries.length} Verified Projects successfully synced to Supabase!`);
  }
}

run().catch(console.error);
