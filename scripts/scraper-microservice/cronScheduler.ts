import { runScraperTask } from './scraperEngine';

console.log('[CRON SERVICE] UrbanX Scraper Microservice Cron Scheduler Active.');

// Run a scheduled task for GujRERA and 4 portals
async function triggerScheduledRun() {
  console.log('[CRON SERVICE] Triggering scheduled multi-portal price sync...');
  await runScraperTask({ portalName: 'gujrera' });
  await runScraperTask({ portalName: '99acres' });
  await runScraperTask({ portalName: 'magicbricks' });
  await runScraperTask({ portalName: 'squareyards' });
  console.log('[CRON SERVICE] All scheduled jobs finished cleanly.');
}

// In production, this runs via pg_cron or node-cron
if (process.argv.includes('--run-now')) {
  triggerScheduledRun();
}
