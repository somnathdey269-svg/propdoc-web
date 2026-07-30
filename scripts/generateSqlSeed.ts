import { writeFileSync } from 'fs';
import { AHMEDABAD_LOCALITY_DIRECTORY, generateAuthenticProperties } from '../src/data/ahmedabadData';

function buildSqlSeed() {
  let sql = `-- ==============================================================================
-- PROPDOC INITIAL DATA SEED SCRIPT
-- Inserts 200+ Localities and Verified Projects into Supabase
-- ==============================================================================

-- 1. INSERT LOCALITIES
INSERT INTO public.localities (name, city, zone, latitude, longitude, tier, avg_price_per_sqft)
VALUES
`;

  const localityValues = Object.values(AHMEDABAD_LOCALITY_DIRECTORY).map((loc) => {
    let zone = 'South & West';
    if (loc.city === 'Gandhinagar') zone = 'Gandhinagar';
    else if (loc.lat > 23.08) zone = 'North Ahmedabad';
    else if (loc.lng > 72.64) zone = 'East Ahmedabad';

    const cleanName = loc.name.replace(/'/g, "''");
    const cleanCity = loc.city.replace(/'/g, "''");
    const cleanTier = loc.tier.replace(/'/g, "''");

    return `('${cleanName}', '${cleanCity}', '${zone}', ${loc.lat}, ${loc.lng}, '${cleanTier}', ${loc.avgPricePerSqFt})`;
  });

  sql += localityValues.join(',\n') + '\nON CONFLICT (name) DO NOTHING;\n\n';

  // 2. INSERT PROJECTS
  sql += `-- 2. INSERT VERIFIED PROJECTS
INSERT INTO public.projects (name, developer, locality_name, city, category, price_min_inr, price_max_inr, price_per_sqft, price_per_sqyd, valuation_tier, is_bank_auction, is_featured, rera_id, cover_image, latitude, longitude, total_units)
VALUES
`;

  const projects = generateAuthenticProperties();
  const projectValues = projects.map((p) => {
    const cleanName = p.name.replace(/'/g, "''");
    const cleanDev = (p.builder?.name || 'Top Developer').replace(/'/g, "''");
    const cleanLoc = p.locality.replace(/'/g, "''");
    const cleanCity = p.city.replace(/'/g, "''");
    const cleanCat = p.category.replace(/'/g, "''");
    const cleanRera = (p.reraNumber || 'PR/GJ/AHMEDABAD/2026/001').replace(/'/g, "''");
    const cleanImg = p.coverImage.replace(/'/g, "''");
    const valTier = p.valuationTier || 'at-avg';

    return `('${cleanName}', '${cleanDev}', '${cleanLoc}', '${cleanCity}', '${cleanCat}', ${p.priceRangeMinInr}, ${p.priceRangeMaxInr}, ${p.pricePerSqFt}, ${p.pricePerSqYd}, '${valTier}', ${p.isBankAuction ? 'TRUE' : 'FALSE'}, ${p.isFeatured ? 'TRUE' : 'FALSE'}, '${cleanRera}', '${cleanImg}', ${p.coordinates.lat}, ${p.coordinates.lng}, ${p.totalUnits})`;
  });

  sql += projectValues.join(',\n') + '\nON CONFLICT (name) DO NOTHING;\n';

  writeFileSync('supabase/seed_data.sql', sql);
  console.log('✅ Generated supabase/seed_data.sql successfully!');
}

buildSqlSeed();
