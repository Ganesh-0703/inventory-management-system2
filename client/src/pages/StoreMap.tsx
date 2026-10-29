import React, { useState } from 'react';
import {
  MapPin,
  ThermometerSnowflake,
  Package,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';

export const StoreMap: React.FC = () => {
  const { products, metrics } = useStore();
  const [selectedBin, setSelectedBin] = useState<string>('COLD-01-A');

  // Group products by bin
  const binMap: Record<string, Product[]> = {};
  for (const p of products) {
    if (!binMap[p.binLocation]) {
      binMap[p.binLocation] = [];
    }
    binMap[p.binLocation].push(p);
  }

  const selectedProducts = binMap[selectedBin] || [];

  const zones = [
    {
      title: 'Walk-in Chiller Room (4°C)',
      code: 'COLD',
      icon: ThermometerSnowflake,
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      bins: ['COLD-01-A', 'COLD-01-B', 'COLD-02-A', 'COLD-02-B', 'COLD-03-A', 'COLD-03-B', 'COLD-04-A'],
    },
    {
      title: 'Deep Freeze Zone (-18°C)',
      code: 'FREEZE',
      icon: ThermometerSnowflake,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      bins: ['FREEZE-01-A', 'FREEZE-01-B'],
    },
    {
      title: 'Aisle A: Fresh & Daily Staples',
      code: 'A',
      icon: Layers,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      bins: ['A-01-A1', 'A-02-B1', 'A-02-B2', 'A-03-A1', 'A-03-B1', 'A-04-A1'],
    },
    {
      title: 'Aisle B: Snacks & Instant Foods',
      code: 'B',
      icon: Layers,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      bins: ['B-01-A1', 'B-02-B1', 'B-02-B2', 'B-03-A1'],
    },
    {
      title: 'Aisle C: Personal Care & Pharma',
      code: 'C',
      icon: Layers,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      bins: ['C-01-A1', 'C-01-B1', 'C-02-A1'],
    },
    {
      title: 'Aisle D: Household & Cleaning',
      code: 'D',
      icon: Layers,
      color: 'border-slate-500/40 bg-slate-800/40 text-slate-300',
      bins: ['D-01-A1', 'D-01-B1', 'D-02-A1'],
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Dark Store 2D Layout & Bin Heatmap</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ganesh Hub #01
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical layout optimized for &lt; 120s picker walking route. Tap any bin coordinate to inspect contents.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
            <span className="text-slate-400">Cold Chain (4°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span className="text-slate-400">Ambient Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-400" />
            <span className="text-slate-400">Low / Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Interactive Dark Store Floor Plan */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dispatch Dock and Packing Station Representation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-300 font-bold">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Station 1: High-Speed Packing Bays</span>
              </div>
              <span className="text-[10px] text-slate-400">3 Active Stations</span>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Station 2: Rider Dispatch Dock</span>
              </div>
              <span className="text-[10px] text-slate-400">10-Min Handover</span>
            </div>
          </div>

          {/* Zones Layout */}
          <div className="space-y-4">
            {zones.map((zone) => {
              const Icon = zone.icon;
              return (
                <div
                  key={zone.code}
                  className={`p-4 rounded-2xl border ${zone.color} space-y-3 transition`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{zone.title}</span>
                    </div>
                    <span className="text-[11px] opacity-80">{zone.bins.length} Racks / Bins</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {zone.bins.map((binId) => {
                      const prods = binMap[binId] || [];
                      const isSelected = selectedBin === binId;
                      const hasLowStock = prods.some((p) => p.stockOnHand <= p.reorderPoint);
                      const hasOutOfStock = prods.some((p) => p.stockOnHand <= 0);

                      let badgeClass = 'border-slate-700 bg-slate-900/80 hover:border-pink-500/50';
                      if (hasOutOfStock) {
                        badgeClass = 'border-rose-500/50 bg-rose-950/40 text-rose-300';
                      } else if (hasLowStock) {
                        badgeClass = 'border-amber-500/50 bg-amber-950/40 text-amber-300';
                      } else if (prods.length > 0) {
                        badgeClass = 'border-slate-700 bg-slate-900/90 text-slate-200';
                      }

                      if (isSelected) {
                        badgeClass += ' ring-2 ring-pink-500 border-pink-500 shadow-lg shadow-pink-500/20';
                      }

                      return (
                        <button
                          key={binId}
                          onClick={() => setSelectedBin(binId)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-20 ${badgeClass}`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                            <span>{binId}</span>
                            {hasOutOfStock && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {prods.length > 0 ? (
                              <span className="text-slate-300 font-medium">
                                {prods.length} SKU{prods.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-600">Empty</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Bin Details Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 sticky top-16">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-pink-400">INSPECTING BIN</span>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                  {selectedBin}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-100 mt-1">
                Bin Coordinate {selectedBin}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedProducts.length} SKU(s) assigned to this location
              </p>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <Package className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                This bin coordinate is currently vacant. Available for new Inward GRN allocation.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {selectedProducts.map((p) => {
                  const isLow = p.stockOnHand <= p.reorderPoint;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-100 truncate">{p.name}</h4>
                          <div className="text-[11px] text-pink-400 font-mono mt-0.5">
                            SKU: {p.sku}
                          </div>
                          <div className="text-[10px] text-slate-400">Batch: {p.batchNumber}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px]">
                        <div>
                          <span className="text-slate-400">Stock on hand: </span>
                          <span
                            className={`font-mono font-bold ${
                              isLow ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {p.stockOnHand} {p.unit}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-200">₹{p.sellingPrice}</div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Expiry: {p.expiryDate}</span>
                        <span>Zone: {p.temperatureZone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

