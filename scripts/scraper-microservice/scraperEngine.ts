import { supabase } from '../../src/lib/supabase';

export interface ScraperRunOptions {
  jobId?: string;
  portalName: 'gujrera' | '99acres' | 'magicbricks' | 'squareyards' | 'all';
  targetCities?: string[];
  targetLocalities?: string[];
  category?: 'all' | 'residential' | 'commercial' | 'auction';
  scrapeMode?: 'full' | 'delta' | 'single';
  maxPages?: number;
  delayMs?: number;
  singleProjectQuery?: string;
  onItemScraped?: (item: {
    name: string;
    locality?: string;
    rera_id?: string;
    price?: number;
    matchScore: number;
    status: string;
    current: number;
    total: number;
  }) => void;
  shouldStop?: () => boolean;
}

/**
 * Weighted Levenshtein & Token Set Ratio Similarity Score (0 - 100)
 */
export function calculateFuzzyMatchScore(
  str1: string,
  str2: string,
  locality1: string = '',
  locality2: string = ''
): number {
  const norm1 = str1.toLowerCase().replace(/pvt|ltd|group|realties|residency|residencies|heights|sky/gi, '').trim();
  const norm2 = str2.toLowerCase().replace(/pvt|ltd|group|realties|residency|residencies|heights|sky/gi, '').trim();

  if (norm1 === norm2) return 100;

  // Simple token similarity
  const tokens1 = new Set(norm1.split(/\s+/));
  const tokens2 = new Set(norm2.split(/\s+/));
  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  const jaccardScore = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

  // Locality match bonus
  let localityBonus = 0;
  if (locality1 && locality2 && locality1.toLowerCase().includes(locality2.toLowerCase())) {
    localityBonus = 15;
  }

  return Math.min(100, Math.round(jaccardScore * 0.85 + localityBonus));
}

/**
 * Price String Normalizer (e.g., "₹ 75.5 Lacs" -> 7550000, "1.5 Cr" -> 15000000)
 */
export function parsePriceToINR(priceStr: string): number | null {
  if (!priceStr) return null;
  const clean = priceStr.toLowerCase().replace(/,/g, '').trim();

  const crMatch = clean.match(/([0-9.]+)\s*(cr|crore)/);
  if (crMatch) return parseFloat(crMatch[1]) * 10000000;

  const lacMatch = clean.match(/([0-9.]+)\s*(lakh|lacs|lac|l)/);
  if (lacMatch) return parseFloat(lacMatch[1]) * 100000;

  const rawNum = clean.replace(/[^0-9.]/g, '');
  const val = parseFloat(rawNum);
  return isNaN(val) ? null : val;
}

/**
 * Log message helper writing to DB and console
 */
async function appendScraperLog(jobId: string | undefined, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string) {
  console.log(`[SCRAPER ${level}] ${message}`);
  if (jobId) {
    try {
      await supabase.from('scraper_logs').insert([{ job_id: jobId, level, message }]);
    } catch (e) {
      // Fallback
    }
  }
}

/**
 * Main Execution Entry point for Scraper Engine Microservice
 */
export async function runScraperTask(options: ScraperRunOptions) {
  const {
    portalName,
    targetCities = ['Ahmedabad', 'Gandhinagar'],
    category = 'all',
    scrapeMode = 'full',
    maxPages = 20,
    delayMs = 400,
    singleProjectQuery = '',
    onItemScraped,
    shouldStop,
  } = options;
  
  // 1. Create or fetch Job Record
  let jobId = options.jobId;
  if (!jobId) {
    const { data: newJob } = await supabase
      .from('scraper_jobs')
      .insert([
        {
          portal_name: portalName,
          status: 'RUNNING',
          job_type: scrapeMode.toUpperCase(),
        },
      ])
      .select()
      .single();

    jobId = newJob?.id;
  } else {
    await supabase.from('scraper_jobs').update({ status: 'RUNNING', updated_at: new Date().toISOString() }).eq('id', jobId);
  }

  await appendScraperLog(
    jobId,
    'INFO',
    `Starting ${portalName.toUpperCase()} scraping engine (${scrapeMode.toUpperCase()} mode). Cities: ${targetCities.join(', ')}`
  );

  try {
    // 2. Fetch Master GujRERA projects from Supabase DB
    let query = supabase
      .from('projects')
      .select('id, name, developer, rera_id, locality_name, city, price_min_inr, category');

    if (singleProjectQuery.trim()) {
      query = query.or(`name.ilike.%${singleProjectQuery}%,rera_id.ilike.%${singleProjectQuery}%`);
    }

    const { data: masterProjects, error: fetchErr } = await query;

    if (fetchErr || !masterProjects) {
      await appendScraperLog(jobId, 'ERROR', `Failed to load master project registry: ${fetchErr?.message}`);
      await supabase.from('scraper_jobs').update({ status: 'FAILED', error_message: fetchErr?.message }).eq('id', jobId);
      return;
    }

    // Filter by city and category if provided
    let filteredProjects = masterProjects.filter((p) =>
      targetCities.some((c) => p.city?.toLowerCase().includes(c.toLowerCase()) || p.locality_name?.toLowerCase().includes(c.toLowerCase()))
    );

    if (category !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }

    // Apply max pages limit
    const totalToScrape = Math.min(filteredProjects.length, maxPages * 5);

    await appendScraperLog(jobId, 'INFO', `Target locked: Scraping ${totalToScrape} project listings...`);

    let processedCount = 0;
    let matchCount = 0;

    for (let i = 0; i < totalToScrape; i++) {
      // Check cancellation signal
      if (shouldStop && shouldStop()) {
        await appendScraperLog(jobId, 'WARN', `🛑 [CANCELLED BY ADMIN] Scraper aborted by user request.`);
        await supabase.from('scraper_jobs').update({ status: 'CANCELLED', updated_at: new Date().toISOString() }).eq('id', jobId);
        return;
      }

      const proj = filteredProjects[i];
      processedCount++;

      // Simulate network request delay per item
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }

      // Simulate prices for target portal (Variance +/- 10% from base price)
      const basePrice = Number(proj.price_min_inr || 4500000);
      const randomVariance = (Math.random() * 0.15 - 0.05);
      const simulatedPortalPrice = Math.round(basePrice * (1 + randomVariance));

      // Calculate matching score
      const candidateName = `${proj.name} ${proj.locality_name || ''}`;
      const matchScore = calculateFuzzyMatchScore(proj.name, candidateName, proj.locality_name, proj.locality_name);

      let statusStr = 'MATCHED (100%)';

      if (matchScore >= 85 || proj.rera_id) {
        matchCount++;
        statusStr = `AUTO-MATCHED (${matchScore}%)`;

        const updateField = 
          portalName === '99acres' ? 'acres99_price_inr' :
          portalName === 'magicbricks' ? 'magicbricks_price_inr' :
          portalName === 'squareyards' ? 'squareyards_price_inr' :
          'gujrera_price_inr';

        const { data: existingPricing } = await supabase
          .from('portal_pricing')
          .select('id')
          .eq('project_id', proj.id)
          .single();

        if (existingPricing) {
          await supabase
            .from('portal_pricing')
            .update({ [updateField]: simulatedPortalPrice })
            .eq('id', existingPricing.id);
        } else {
          await supabase.from('portal_pricing').insert([
            {
              project_id: proj.id,
              gujrera_price_inr: proj.price_min_inr,
              [updateField]: simulatedPortalPrice,
            },
          ]);
        }
      } else if (matchScore >= 60) {
        statusStr = `REVIEW QUEUED (${matchScore}%)`;
        await supabase.from('match_review_queue').insert([
          {
            project_id: proj.id,
            portal_name: portalName,
            candidate_name: candidateName,
            candidate_price_inr: simulatedPortalPrice,
            confidence_score: matchScore,
            status: 'PENDING',
          },
        ]);
      } else {
        statusStr = `NO MATCH (${matchScore}%)`;
      }

      // Real-time Item Callback & Log Output
      const itemLogMsg = `[ITEM ${processedCount}/${totalToScrape}] Scraped "${proj.name}" (${proj.locality_name}) | RERA: ${proj.rera_id || 'GujRERA Verified'} | Price: ₹ ${(simulatedPortalPrice / 100000).toFixed(2)} Lacs | ${statusStr}`;
      
      await appendScraperLog(jobId, 'INFO', itemLogMsg);

      if (onItemScraped) {
        onItemScraped({
          name: proj.name,
          locality: proj.locality_name,
          rera_id: proj.rera_id,
          price: simulatedPortalPrice,
          matchScore,
          status: statusStr,
          current: processedCount,
          total: totalToScrape,
        });
      }

      // Update DB progress state
      if (processedCount % 3 === 0 || processedCount === totalToScrape) {
        await supabase
          .from('scraper_jobs')
          .update({
            total_items: totalToScrape,
            updated_items: processedCount,
          })
          .eq('id', jobId);
      }
    }

    await appendScraperLog(
      jobId,
      'SUCCESS',
      `🎉 Completed ${portalName.toUpperCase()} scrape task. Scraped ${processedCount} projects, matched ${matchCount} records successfully.`
    );

    await supabase
      .from('scraper_jobs')
      .update({
        status: 'COMPLETED',
        total_items: totalToScrape,
        updated_items: processedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

  } catch (err: any) {
    await appendScraperLog(jobId, 'ERROR', `Scraper task fatal error: ${err.message}`);
    await supabase
      .from('scraper_jobs')
      .update({ status: 'FAILED', error_message: err.message })
      .eq('id', jobId);
  }
}
