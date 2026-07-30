export type ListingType = 'Sale' | 'Rent' | 'Both';
export type PropertyCategory = 'Luxury' | 'Residential' | 'Commercial' | 'Villa' | 'Penthouse' | 'Bank Auction';
export type TimeOfDay = 'sunrise' | 'midday' | 'sunset' | 'night';
export type UnitStatus = 'AVAILABLE' | 'HOLD' | 'SOLD';
export type PriceMetric = 'total' | 'sqft' | 'sqyd';

export interface MultiSourcePricing {
  gujReraPriceInr?: number;
  acres99PriceInr?: number;
  squareYardsPriceInr?: number;
  bankNetPriceInr?: number; // Stressed Bank Auction Reserve Price
  magicbricksPriceInr?: number;
  monthlyRentInr?: number;
  lowestPriceInr: number;
  lowestPriceSource: 'GujRERA' | '99acres' | 'SquareYards' | 'BankNet' | 'Magicbricks';
  sourceUrls?: {
    gujReraUrl?: string;
    acres99Url?: string;
    squareYardsUrl?: string;
    bankNetUrl?: string;
    magicbricksUrl?: string;
  };
}

export interface BuilderInfo {
  id: string;
  name: string;
  logo: string;
  reraRegNumber: string;
  gstin?: string;
  isVerified: boolean;
  projectsCompleted: number;
  ongoingProjects: number;
  rating: number;
  phone: string;
  email: string;
  micrositeSubdomain?: string;
}

export interface NearbyPlace {
  name: string;
  category: 'Hospital' | 'School' | 'Temple' | 'Garden' | 'Gym' | 'Cafe' | 'Hotel' | 'Metro' | 'Shopping' | 'Riverfront';
  distanceKm: number;
  timeMins: number;
}

export interface BuildingUnit {
  id: string;
  unitNumber: string;
  floorNumber: number;
  tower: string;
  bhk: string;
  carpetAreaSqFt: number;
  priceInr: number;
  monthlyRentInr?: number;
  status: UnitStatus;
  facing: string;
}

export interface FloorPlan {
  bhk: string;
  carpetAreaSqFt: number;
  priceInr: number;
  monthlyRentInr?: number;
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
}

export interface PropertyProject {
  id: string;
  name: string;
  slug: string;
  builder: BuilderInfo;
  category: PropertyCategory;
  listingType: ListingType;
  status: 'Under Construction' | 'Ready to Move';
  locality: string;
  city: 'Ahmedabad' | 'Gandhinagar';
  address: string;
  reraNumber: string;
  coordinates: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  buildingHeightMeters: number;
  totalTowers: number;
  totalUnits: number;
  priceRangeMinInr: number;
  priceRangeMaxInr: number;
  monthlyRentMinInr?: number;
  pricePerSqFt: number;
  pricePerSqYd: number; // 1 Sq Yard = 9 Sq Ft
  multiSourcePricing: MultiSourcePricing;
  completionDate: string;
  coverImage: string;
  images: string[];
  brochurePdfUrl?: string;
  description: string;
  aiSummary: {
    keyHighlights: string[];
    investmentRating: string;
    projectedYield: string;
    expectedAppreciation3Yr: string;
    neighborhoodVibe: string;
  };
  amenities: {
    id: string;
    name: string;
    category: string;
    icon: string;
  }[];
  nearbyPlaces: NearbyPlace[];
  priceHistory: {
    year: number;
    avgPricePerSqFt: number;
  }[];
  floorPlans: FloorPlan[];
  unitsStack: BuildingUnit[];
  isFeatured: boolean;
  isBankAuction?: boolean;
  valuationTier?: 'below-avg' | 'at-avg' | 'above-avg' | 'bank-auction';
  isClaimed: boolean;
}

export interface Lead {
  id: string;
  projectId: string;
  projectName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredBhk: string;
  budgetMax: number;
  intentScore: number;
  behaviorSummary: string;
  status: 'NEW' | 'CONTACTED' | 'VISITED' | 'CLOSED';
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  locality: string;
  category: string;
  listingType: 'All' | 'Sale' | 'Rent';
  priceMetric: PriceMetric;
  priceMin: number;
  priceMax: number;
  bhk: string;
  isBankAuctionOnly: boolean;
}
