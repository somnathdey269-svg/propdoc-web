import { Injectable, signal, computed } from '@angular/core';
import { PropertyProject, LocalityInfo, SearchFilters, LocalityTier } from '../../types';

// Locality Directory Data
export const AHMEDABAD_LOCALITY_DIRECTORY: Record<string, LocalityInfo> = {
  'South Bopal': { name: 'South Bopal', city: 'Ahmedabad', lat: 23.0250, lng: 72.4650, tier: 'Mid-Luxury', avgPricePerSqFt: 5800, authenticProjects: ['Sun South Park', 'Orchid Whitefield', 'HN Safal Sky City', 'Goyal Orchid Greens', 'Shivalik Platinum'] },
  'Bopal': { name: 'Bopal', city: 'Ahmedabad', lat: 23.0330, lng: 72.4720, tier: 'Mid-Luxury', avgPricePerSqFt: 5600, authenticProjects: ['Bopal Luxury Greens', 'Savvy Bopal Residency', 'Shree Rang Bopal', 'Goyal Orchid Bopal'] },
  'Shela': { name: 'Shela', city: 'Ahmedabad', lat: 23.0150, lng: 72.4550, tier: 'Mid-Luxury', avgPricePerSqFt: 5400, authenticProjects: ['Goyal Riviera Elegance', 'Applewoods Villa Enclave', 'HN Safal Sky City Shela', 'Shivalik Lakeview'] },
  'Bodakdev': { name: 'Bodakdev', city: 'Ahmedabad', lat: 23.0400, lng: 72.5100, tier: 'Ultra-Luxury', avgPricePerSqFt: 9500, authenticProjects: ['Shivalik Edge', 'Synthesis Spire', 'True Value Nirman', 'Sharanya Skyvue', 'Venus Stratum'] },
  'Sindhu Bhavan Road': { name: 'Sindhu Bhavan Road', city: 'Ahmedabad', lat: 23.0450, lng: 72.4950, tier: 'Ultra-Luxury', avgPricePerSqFt: 11200, authenticProjects: ['Shivalik Shilp', 'Sharanya Skyvue SBR', 'Banyan Tree Elegance', 'Venus Ground zero'] },
  'Thaltej': { name: 'Thaltej', city: 'Ahmedabad', lat: 23.0550, lng: 72.5120, tier: 'Ultra-Luxury', avgPricePerSqFt: 9200, authenticProjects: ['Thaltej Heights', 'Goyal Palladium Thaltej', 'Sharanya Skyvue Thaltej', 'Shivalik Platinum'] },
  'Science City': { name: 'Science City', city: 'Ahmedabad', lat: 23.0850, lng: 72.5050, tier: 'Mid-Luxury', avgPricePerSqFt: 6400, authenticProjects: ['Samaveda Sukun', 'Supercity Luxury', 'Artisan Unique', 'Shree Radha Heights'] },
  'Gota': { name: 'Gota', city: 'Ahmedabad', lat: 23.1000, lng: 72.5300, tier: 'Budget-Mid', avgPricePerSqFt: 4650, authenticProjects: ['Vandematram Icon', 'Shayona City', 'ICB Flora', 'Olive Greens'] },
  'Vaishnodevi Circle': { name: 'Vaishnodevi Circle', city: 'Ahmedabad', lat: 23.1300, lng: 72.5380, tier: 'Mid-Luxury', avgPricePerSqFt: 5500, authenticProjects: ['Vaishnodevi Skycity', 'Shree Rang Vaishnodevi', 'HN Safal Circle Park'] },
  'Chandkheda': { name: 'Chandkheda', city: 'Ahmedabad', lat: 23.1100, lng: 72.5800, tier: 'Budget-Mid', avgPricePerSqFt: 4250, authenticProjects: ['Godrej Garden City', 'Savvy Swaraaj', 'Pebble Bay Chandkheda', 'Devnandan Sky'] },
  'GIFT City': { name: 'GIFT City', city: 'Gandhinagar', lat: 23.1600, lng: 72.6800, tier: 'SEZ-Commercial', avgPricePerSqFt: 7500, authenticProjects: ['Brigade International Financial Center', 'GIFT One Tower', 'Sobha Dream Heights', 'Hiranandani Signature'] },
  'Kudasan': { name: 'Kudasan', city: 'Gandhinagar', lat: 23.1850, lng: 72.6420, tier: 'Mid-Luxury', avgPricePerSqFt: 5200, authenticProjects: ['Pramukh Oracle Kudasan', 'Swagat Flamingo', 'Shree Rang Heights Kudasan'] },
  'Prahlad Nagar': { name: 'Prahlad Nagar', city: 'Ahmedabad', lat: 23.0120, lng: 72.5100, tier: 'Ultra-Luxury', avgPricePerSqFt: 8800, authenticProjects: ['Prahladnagar Trade Center', 'Venus Atlantis', 'Titanium City Center', 'Shivalik Abode'] },
  'SG Highway': { name: 'SG Highway', city: 'Ahmedabad', lat: 23.0400, lng: 72.5000, tier: 'Ultra-Luxury', avgPricePerSqFt: 9400, authenticProjects: ['SG Highway Landmark', 'Titanium Square SG Highway', 'Goyal Palladium SG Highway'] },
  'Nikol Kathwada': { name: 'Nikol Kathwada', city: 'Ahmedabad', lat: 23.0600, lng: 72.6750, tier: 'Budget-Mid', avgPricePerSqFt: 3650, authenticProjects: ['Swaminarayan Park Nikol', 'Shree Rang Residency', 'Goyal Orchid Kathwada'] },
};

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
];

@Injectable({ providedIn: 'root' })
export class PropertyDataService {

  // Signals
  public properties = signal<PropertyProject[]>(this.generateProperties());
  public selectedProperty = signal<PropertyProject | null>(null);
  public activeLocality = signal<string>('All Localities');

  // Search Filters Signal
  public filters = signal<SearchFilters>({
    query: '',
    locality: 'All Localities',
    category: 'All',
    listingType: 'All',
    priceMetric: 'total',
    priceMin: 0,
    priceMax: 50000000,
    bhk: 'All',
    isBankAuctionOnly: false
  });

  // Filtered Properties Computation
  public filteredProperties = computed(() => {
    const list = this.properties();
    const f = this.filters();

    return list.filter(item => {
      const q = f.query.toLowerCase().trim();
      const matchesQuery = !q ||
        item.name.toLowerCase().includes(q) ||
        item.builder.name.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.reraNumber.toLowerCase().includes(q);

      const matchesLocality = f.locality === 'All Localities' || item.locality === f.locality;
      const matchesCategory = f.category === 'All' || item.category === f.category;
      const matchesListingType = f.listingType === 'All' || item.listingType === f.listingType;
      const matchesBankAuction = !f.isBankAuctionOnly || item.isBankAuction;

      const priceVal = f.priceMetric === 'sqft' ? item.pricePerSqFt :
                        f.priceMetric === 'sqyd' ? item.pricePerSqYd :
                        item.priceRangeMinInr;

      const matchesPrice = priceVal >= f.priceMin && (f.priceMax === 0 || priceVal <= f.priceMax);

      return matchesQuery && matchesLocality && matchesCategory && matchesListingType && matchesBankAuction && matchesPrice;
    });
  });

  private generateProperties(): PropertyProject[] {
    const projects: PropertyProject[] = [];
    let globalId = 101;
    const entries = Object.entries(AHMEDABAD_LOCALITY_DIRECTORY);

    entries.forEach(([locName, locInfo]) => {
      locInfo.authenticProjects.forEach((projName, i) => {
        const angle = (i * 137.5) * (Math.PI / 180);
        const radius = 0.0015 + ((i % 7) * 0.0018);
        const lat = locInfo.lat + (Math.sin(angle) * radius);
        const lng = locInfo.lng + (Math.cos(angle) * radius);

        const baseRate = locInfo.avgPricePerSqFt + ((i * 145) % 900) - 450;
        const basePriceInr = Math.round(baseRate * (1100 + (i % 5) * 400));
        const maxPriceInr = Math.round(basePriceInr * 1.65);
        const isBankAuction = i % 8 === 0;

        let valuationTier: 'below-avg' | 'at-avg' | 'above-avg' | 'bank-auction' = 'at-avg';
        if (isBankAuction) valuationTier = 'bank-auction';
        else if (baseRate < locInfo.avgPricePerSqFt * 0.95) valuationTier = 'below-avg';
        else if (baseRate > locInfo.avgPricePerSqFt * 1.05) valuationTier = 'above-avg';

        projects.push({
          id: `proj-${globalId}`,
          name: projName,
          slug: projName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          builder: {
            id: `builder-${i + 1}`,
            name: projName.split(' ')[0] + ' Group',
            logo: COVER_IMAGES[0],
            reraRegNumber: `PR/GJ/AHMEDABAD/AUDA/RAA${10000 + globalId}/010126`,
            isVerified: true,
            projectsCompleted: 12 + (i % 5),
            ongoingProjects: 3,
            rating: 4.8,
            phone: '+91 98980 12345',
            email: 'sales@propdoc.in',
          },
          category: locInfo.tier === 'SEZ-Commercial' ? 'Commercial' : (locInfo.tier === 'Ultra-Luxury' ? 'Luxury' : 'Residential'),
          listingType: 'Sale',
          status: i % 2 === 0 ? 'Under Construction' : 'Ready to Move',
          locality: locName,
          city: locInfo.city,
          address: `${projName}, ${locName}, ${locInfo.city}, Gujarat`,
          reraNumber: `PR/GJ/AHMEDABAD/AUDA/RAA${10000 + globalId}/010126`,
          coordinates: { lat, lng, elevation: 55 + (i % 20) },
          buildingHeightMeters: 45 + (i * 3 % 40),
          totalTowers: 3 + (i % 4),
          totalUnits: 120 + (i % 80),
          priceRangeMinInr: basePriceInr,
          priceRangeMaxInr: maxPriceInr,
          pricePerSqFt: baseRate,
          pricePerSqYd: Math.round(baseRate * 9),
          multiSourcePricing: {
            gujReraPriceInr: basePriceInr,
            acres99PriceInr: Math.round(basePriceInr * 1.03),
            magicbricksPriceInr: Math.round(basePriceInr * 1.05),
            squareYardsPriceInr: Math.round(basePriceInr * 0.97),
            bankNetPriceInr: isBankAuction ? Math.round(basePriceInr * 0.75) : undefined,
            lowestPriceInr: isBankAuction ? Math.round(basePriceInr * 0.75) : Math.round(basePriceInr * 0.97),
            lowestPriceSource: isBankAuction ? 'BankNet' : 'SquareYards',
            sourceUrls: {
              gujReraUrl: `https://gujrera.gujarat.gov.in`,
              acres99Url: 'https://www.99acres.com',
              squareYardsUrl: 'https://www.squareyards.com',
              magicbricksUrl: 'https://www.magicbricks.com',
            }
          },
          completionDate: '2026-12-31',
          coverImage: COVER_IMAGES[i % COVER_IMAGES.length],
          images: COVER_IMAGES,
          description: `${projName} is a landmark project situated in ${locName}, offering state-of-the-art amenities, RERA compliance, and multi-portal pricing transparently matched.`,
          aiSummary: {
            keyHighlights: [
              '100% GujRERA Approved & Verified Title',
              'Prime Location in High Growth Corridor',
              'Multi-Portal Price Match Transparency',
              'Clubhouse, Infinity Pool & Solar Backed Power'
            ],
            investmentRating: 'AA+ Excellent',
            projectedYield: '5.8% p.a.',
            expectedAppreciation3Yr: '24% - 32%',
            neighborhoodVibe: 'Premium Residential & Commercial Growth Hub'
          },
          amenities: [
            { id: '1', name: 'Swimming Pool', category: 'Leisure', icon: 'pool' },
            { id: '2', name: 'Gymnasium', category: 'Fitness', icon: 'fitness' },
            { id: '3', name: 'EV Charging Bay', category: 'Eco', icon: 'ev' },
            { id: '4', name: '24x7 High-Tech Security', category: 'Security', icon: 'shield' }
          ],
          nearbyPlaces: [
            { name: 'Sardar Vallabhbhai Patel Airport', category: 'Metro', distanceKm: 12.4, timeMins: 22 },
            { name: 'CIMS Super Speciality Hospital', category: 'Hospital', distanceKm: 2.1, timeMins: 6 },
            { name: 'Nirma University Campus', category: 'School', distanceKm: 3.5, timeMins: 9 }
          ],
          priceHistory: [
            { year: 2023, avgPricePerSqFt: Math.round(baseRate * 0.85) },
            { year: 2024, avgPricePerSqFt: Math.round(baseRate * 0.92) },
            { year: 2025, avgPricePerSqFt: Math.round(baseRate * 0.98) },
            { year: 2026, avgPricePerSqFt: baseRate }
          ],
          floorPlans: [
            { bhk: '3 BHK Luxury', carpetAreaSqFt: 1450, priceInr: basePriceInr, imageUrl: COVER_IMAGES[1], bedrooms: 3, bathrooms: 3, balconies: 2 },
            { bhk: '4 BHK Penthouse', carpetAreaSqFt: 2100, priceInr: maxPriceInr, imageUrl: COVER_IMAGES[2], bedrooms: 4, bathrooms: 4, balconies: 3 }
          ],
          unitsStack: [
            { id: `u-${globalId}-1`, unitNumber: 'A-402', floorNumber: 4, tower: 'A', bhk: '3 BHK', carpetAreaSqFt: 1450, priceInr: basePriceInr, status: 'AVAILABLE', facing: 'East' },
            { id: `u-${globalId}-2`, unitNumber: 'B-801', floorNumber: 8, tower: 'B', bhk: '4 BHK', carpetAreaSqFt: 2100, priceInr: maxPriceInr, status: 'AVAILABLE', facing: 'North-East' }
          ],
          isFeatured: i % 3 === 0,
          isBankAuction,
          valuationTier,
          isClaimed: i % 5 === 0
        });

        globalId++;
      });
    });

    return projects;
  }
}
