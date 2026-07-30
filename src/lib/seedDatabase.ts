import { supabase, isSupabaseConfigured } from './supabase';
import { AHMEDABAD_LOCALITY_DIRECTORY, generateAuthenticProperties } from '../data/ahmedabadData';

export async function seedSupabaseDatabase() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase credentials missing or invalid in .env');
    return { success: false, message: 'Supabase credentials not configured in .env' };
  }

  try {
    console.log('🚀 Starting Supabase Database Migration & Sync...');

    // 1. SEED LOCALITIES
    const localityEntries = Object.values(AHMEDABAD_LOCALITY_DIRECTORY).map((loc) => {
      let zone = 'South & West';
      const city = loc.city;
      if (city === 'Gandhinagar') {
        zone = 'Gandhinagar';
      } else if (loc.lat > 23.08) {
        zone = 'North Ahmedabad';
      } else if (loc.lng > 72.64) {
        zone = 'East Ahmedabad';
      }

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

    const { error: locError } = await supabase
      .from('localities')
      .upsert(localityEntries, { onConflict: 'name' });

    if (locError) {
      console.error('❌ Error seeding localities:', locError);
      return { success: false, error: locError.message };
    }
    console.log(`✅ Seeded ${localityEntries.length} localities to Supabase!`);

    // 2. SEED AUTHENTIC PROJECTS
    const authenticProjects = generateAuthenticProperties();
    const projectEntries = authenticProjects.map((p) => ({
      name: p.name,
      developer: p.developer.name,
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
      rera_id: p.reraRegistrationNumber,
      cover_image: p.coverImage,
      latitude: p.coordinates.lat,
      longitude: p.coordinates.lng,
      total_units: p.totalUnits,
    }));

    const { error: projError } = await supabase
      .from('projects')
      .upsert(projectEntries, { onConflict: 'name' });

    if (projError) {
      console.error('❌ Error seeding projects:', projError);
      return { success: false, error: projError.message };
    }
    console.log(`✅ Seeded ${projectEntries.length} verified projects to Supabase!`);

    return {
      success: true,
      localitiesCount: localityEntries.length,
      projectsCount: projectEntries.length,
    };
  } catch (err: any) {
    console.error('❌ Migration exception:', err);
    return { success: false, error: err.message };
  }
}
