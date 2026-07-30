import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProjectMatrixItem {
  id: string;
  name: string;
  developer: string;
  locality: string;
  city: string;
  gujrera_price: number;
  acres99_price: number | null;
  magicbricks_price: number | null;
  squareyards_price: number | null;
  baanknet_price: number | null;
}

const MOCK_MATRIX: ProjectMatrixItem[] = [
  {
    id: '1',
    name: 'Verona Elegance',
    developer: 'Verona Group',
    locality: 'Gota',
    city: 'Ahmedabad',
    gujrera_price: 7500000,
    acres99_price: 7800000,
    magicbricks_price: 7650000,
    squareyards_price: 7700000,
    baanknet_price: 6800000,
  },
  {
    id: '2',
    name: 'Shilp Stellar',
    developer: 'Shilp Group',
    locality: 'Bodakdev',
    city: 'Ahmedabad',
    gujrera_price: 21000000,
    acres99_price: 21500000,
    magicbricks_price: 21200000,
    squareyards_price: 21800000,
    baanknet_price: 19500000,
  },
  {
    id: '3',
    name: 'GIFT One Towers',
    developer: 'IL&FS Township',
    locality: 'GIFT City',
    city: 'Gandhinagar',
    gujrera_price: 12000000,
    acres99_price: 12500000,
    magicbricks_price: 12400000,
    squareyards_price: null,
    baanknet_price: null,
  },
  {
    id: '4',
    name: 'Godrej Garden City',
    developer: 'Godrej Properties',
    locality: 'Jagatpur',
    city: 'Ahmedabad',
    gujrera_price: 6500000,
    acres99_price: 6700000,
    magicbricks_price: 6600000,
    squareyards_price: 6650000,
    baanknet_price: 5900000,
  },
  {
    id: '5',
    name: 'Raysan Heights',
    developer: 'Swagat Group',
    locality: 'Raysan',
    city: 'Gandhinagar',
    gujrera_price: 8800000,
    acres99_price: 9100000,
    magicbricks_price: 8950000,
    squareyards_price: 9000000,
    baanknet_price: null,
  },
];

export const PortalPriceMatrix: React.FC = () => {
  const [matrixData, setMatrixData] = useState<ProjectMatrixItem[]>(MOCK_MATRIX);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMatrixFromSupabase();
  }, []);

  const fetchMatrixFromSupabase = async () => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id, name, developer, locality_name, city, price_min_inr,
          portal_pricing (
            gujrera_price_inr, acres99_price_inr, magicbricks_price_inr, squareyards_price_inr, baanknet_auction_price_inr
          )
        `);

      if (projects && projects.length > 0) {
        const formatted: ProjectMatrixItem[] = projects.map((p: any) => {
          const pricing = p.portal_pricing?.[0] || {};
          return {
            id: p.id,
            name: p.name,
            developer: p.developer,
            locality: p.locality_name || 'Ahmedabad',
            city: p.city || 'Ahmedabad',
            gujrera_price: pricing.gujrera_price_inr || p.price_min_inr,
            acres99_price: pricing.acres99_price_inr || null,
            magicbricks_price: pricing.magicbricks_price_inr || null,
            squareyards_price: pricing.squareyards_price_inr || null,
            baanknet_price: pricing.baanknet_auction_price_inr || null,
          };
        });
        setMatrixData(formatted);
      }
    } catch (e) {
      // Fallback mock active
    }
  };

  const filteredData = matrixData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.developer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = cityFilter === 'ALL' || item.city.toUpperCase() === cityFilter.toUpperCase();

    return matchesSearch && matchesCity;
  });

  const formatPrice = (val: number | null) => {
    if (!val) return <span className="text-slate-600 font-normal">--</span>;
    const inLacs = val / 100000;
    if (inLacs >= 100) {
      return <span className="font-semibold text-emerald-400">₹ {(inLacs / 100).toFixed(2)} Cr</span>;
    }
    return <span className="font-semibold text-slate-200">₹ {inLacs.toFixed(2)} L</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Multi-Portal Pricing Intelligence Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live side-by-side price comparisons across GujRERA, 99acres, MagicBricks, SquareYards, and BaankNet Auction listings.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search project or developer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Cities</option>
              <option value="AHMEDABAD">Ahmedabad</option>
              <option value="GANDHINAGAR">Gandhinagar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Project & Locality</th>
                <th className="p-4 text-amber-400">GujRERA Reg</th>
                <th className="p-4 text-indigo-400">99acres</th>
                <th className="p-4 text-rose-400">MagicBricks</th>
                <th className="p-4 text-emerald-400">SquareYards</th>
                <th className="p-4 text-cyan-400">BaankNet Auction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.developer} • <span className="text-slate-500">{item.locality}, {item.city}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-amber-300">
                    {formatPrice(item.gujrera_price)}
                  </td>

                  <td className="p-4 font-mono">
                    {formatPrice(item.acres99_price)}
                  </td>

                  <td className="p-4 font-mono">
                    {formatPrice(item.magicbricks_price)}
                  </td>

                  <td className="p-4 font-mono">
                    {formatPrice(item.squareyards_price)}
                  </td>

                  <td className="p-4 font-mono">
                    {item.baanknet_price ? (
                      <span className="font-bold text-cyan-300">
                        ₹ {(item.baanknet_price / 100000).toFixed(2)} L
                      </span>
                    ) : (
                      <span className="text-slate-600">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalPriceMatrix;
