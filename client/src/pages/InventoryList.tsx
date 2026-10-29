import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Barcode,
  ThermometerSnowflake,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Layers,
  X,
  LayoutGrid,
  List,
  Star,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category, TemperatureZone } from '../types';
import { sounds } from '../utils/audio';

export const InventoryList: React.FC = () => {
  const { products, saveProduct, deleteProduct, adjustStock, openScanner, addToast } = useStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'stock-asc' | 'stock-desc' | 'expiry-soon' | 'name-asc'>('stock-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('CYCLE_COUNT_MISMATCH');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Dairy & Breakfast',
    subCategory: 'Milk',
    brand: '',
    barcode: '',
    mrp: 50,
    sellingPrice: 48,
    costPrice: 40,
    unit: '1 pc',
    stockOnHand: 50,
    reorderPoint: 20,
    safetyStock: 10,
    maxCapacity: 100,
    binLocation: 'A-01-A1',
    temperatureZone: 'Ambient',
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    batchNumber: 'B-' + Math.floor(100 + Math.random() * 900),
    isFastMoving: false,
    isFragile: false,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
  });

  const categories: (Category | 'ALL')[] = [
    'ALL',
    'Dairy & Breakfast',
    'Fresh Fruits & Veg',
    'Cold Beverages',
    'Instant & Snacks',
    'Personal Care',
    'Household & Cleaning',
  ];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.binLocation.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesZone = selectedZone === 'ALL' || p.temperatureZone === selectedZone;

    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') matchesStatus = p.stockOnHand <= p.reorderPoint && p.stockOnHand > 0;
    else if (statusFilter === 'OUT_OF_STOCK') matchesStatus = p.stockOnHand <= 0;
    else if (statusFilter === 'ACTIVE') matchesStatus = p.stockOnHand > p.reorderPoint;
    else if (statusFilter === 'EXPIRING_SOON') {
      const diffDays = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
      matchesStatus = diffDays >= 0 && diffDays <= 7;
    }

    return matchesSearch && matchesCat && matchesZone && matchesStatus;
  });

  // Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === 'stock-asc') return a.stockOnHand - b.stockOnHand;
    if (sortBy === 'stock-desc') return b.stockOnHand - a.stockOnHand;
    if (sortBy === 'expiry-soon') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const openAddModal = () => {
    sounds.playBeep();
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Dairy & Breakfast',
      subCategory: 'General',
      brand: '',
      barcode: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      mrp: 60,
      sellingPrice: 55,
      costPrice: 45,
      unit: '1 pc',
      stockOnHand: 40,
      reorderPoint: 15,
      safetyStock: 10,
      maxCapacity: 120,
      binLocation: 'A-01-A1',
      temperatureZone: 'Ambient',
      expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      batchNumber: 'B-' + Math.floor(100 + Math.random() * 900),
      isFastMoving: false,
      isFragile: false,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    sounds.playBeep();
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    try {
      await saveProduct(formData);
      setIsAddEditModalOpen(false);
    } catch (e) {}
  };

  const openAdjustModal = (prod: Product) => {
    sounds.playBeep();
    setAdjustingProduct(prod);
    setAdjustQty(prod.stockOnHand);
    setAdjustReason('CYCLE_COUNT_MISMATCH');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleQuickRestock = async (prod: Product, amount: number) => {
    sounds.playSuccess();
    try {
      await adjustStock(prod.id, prod.stockOnHand + amount, 'CYCLE_COUNT_MISMATCH', `Quick Restock (+${amount})`);
    } catch (e) {}
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    sounds.playSuccess();
    try {
      await adjustStock(adjustingProduct.id, adjustQty, adjustReason, adjustNotes);
      setIsAdjustModalOpen(false);
    } catch (e) {}
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Title & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Ganesh Store Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {filteredProducts.length} SKUs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time catalog with Flipkart & Amazon quick-commerce layout, FEFO tracking & instant stock adjustment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700">
            <button
              onClick={() => {
                sounds.playBeep();
                setViewMode('grid');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Amazon / Flipkart Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
            <button
              onClick={() => {
                sounds.playBeep();
                setViewMode('table');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Warehouse Spreadsheet View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playBeep();
              openScanner();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95 shadow-sm"
          >
            <Barcode className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Scan SKU</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add SKU</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Product Name, Brand, Barcode, Bin (e.g. Amul, A-01, 890126)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'ALL', label: 'All SKUs' },
              { id: 'LOW_STOCK', label: '⚠️ Low Stock' },
              { id: 'OUT_OF_STOCK', label: '🚫 Out of Stock' },
              { id: 'EXPIRING_SOON', label: '⏳ Near Expiry' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  sounds.playBeep();
                  setStatusFilter(st.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border active:scale-95 ${
                  statusFilter === st.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Temperature Zone Filter */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Temp Zones</option>
              <option value="Ambient">Ambient</option>
              <option value="Chilled 4°C">Chilled 4°C (Cold Chain)</option>
              <option value="Frozen -18°C">Frozen -18°C</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="stock-asc">Sort: Stock (Low to High)</option>
              <option value="stock-desc">Sort: Stock (High to Low)</option>
              <option value="expiry-soon">Sort: Expiry (Soonest First)</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Carousel Pills with Smooth Horizontal Touch Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playBeep();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: FLIPKART & AMAZON STYLE STOREFRONT GRID (Mobile, Tablet, Laptop, Desktop) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.stockOnHand <= p.reorderPoint && p.stockOnHand > 0;
            const isOut = p.stockOnHand <= 0;
            const discountPercent = p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0;
            const fillPercent = Math.min(100, Math.round((p.stockOnHand / (p.maxCapacity || 100)) * 100));

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden"
              >
                {/* Product Card Top: Image + Badges */}
                <div className="relative aspect-square w-full bg-slate-800/40 overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top-Left: Discount Badge (Amazon / Flipkart style) */}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-tight shadow-md">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Top-Right: Fast moving / 10 Mins Badge */}
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {p.isFastMoving && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-slate-950" />
                        HOT
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                      ⚡ 10M
                    </span>
                  </div>

                  {/* Temperature Zone Badge Bottom-Right */}
                  {p.temperatureZone !== 'Ambient' && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md text-cyan-300 border border-cyan-500/30 text-[9px] font-bold flex items-center gap-1 shadow-sm">
                      <ThermometerSnowflake className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{p.temperatureZone.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                {/* Product Info Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {/* Brand & Unit */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="uppercase font-mono text-emerald-400 font-bold tracking-wider truncate max-w-[100px]">
                        {p.brand || 'Ganesh Fresh'}
                      </span>
                      <span className="text-slate-400 text-[10px]">{p.unit}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-2 mt-0.5 leading-snug group-hover:text-emerald-300 transition-colors">
                      {p.name}
                    </h3>

                    {/* Rating Stars (Amazon style) */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>4.8</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">1.2k orders</span>
                    </div>
                  </div>

                  {/* Price & Bin Details */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-100 font-mono">
                        ₹{p.sellingPrice}
                      </span>
                      {p.mrp > p.sellingPrice && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          ₹{p.mrp}
                        </span>
                      )}
                    </div>

                    {/* Bin Location & Stock level bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                        {p.binLocation}
                      </span>
                      <span
                        className={`font-bold font-mono ${
                          isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {p.stockOnHand} in stock
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, fillPercent)}%` }}
                      />
                    </div>

                    {/* Quick Action Buttons on Card */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleQuickRestock(p, 10)}
                        className="py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold active:scale-95 transition flex items-center justify-center gap-1"
                        title="Add +10 units to stock"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+10 Stock</span>
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold active:scale-95 transition flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TRADITIONAL WAREHOUSE SPREADSHEET TABLE */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-3">Bin Location</th>
                  <th className="py-3 px-3">Zone</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-3">Pricing</th>
                  <th className="py-3 px-3">FEFO Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((p) => {
                  const isLow = p.stockOnHand <= p.reorderPoint && p.stockOnHand > 0;
                  const isOut = p.stockOnHand <= 0;
                  const fillPercent = Math.min(100, Math.round((p.stockOnHand / (p.maxCapacity || 100)) * 100));
                  const daysToExpiry = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 truncate group-hover:text-emerald-300 transition">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span className="text-emerald-400 font-semibold">{p.sku}</span>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{p.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-black text-slate-200">
                          {p.binLocation}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.temperatureZone === 'Chilled 4°C'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : p.temperatureZone === 'Frozen -18°C'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.temperatureZone}
                        </span>
                      </td>

                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between font-mono font-bold text-xs mb-1">
                          <span
                            className={
                              isOut
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {p.stockOnHand} units
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            Min: {p.reorderPoint}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(5, fillPercent)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-200">₹{p.sellingPrice}</div>
                        <div className="text-[10px] text-slate-500 line-through">MRP: ₹{p.mrp}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          className={`text-[11px] font-medium font-mono ${
                            daysToExpiry <= 3
                              ? 'text-rose-400 font-bold'
                              : daysToExpiry <= 7
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {p.expiryDate}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {daysToExpiry <= 0 ? 'EXPIRED' : `${daysToExpiry} days left`}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAdjustModal(p)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition"
                            title="Audit / Adjust stock"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
                            title="Edit SKU"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name} from catalog?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SKU MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-100">
                  {editingProduct ? 'Edit Catalog SKU' : 'Add New Product to Dark Store'}
                </h3>
                <p className="text-xs text-slate-400">Configure barcode, bin slot, and safety levels</p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amul Taaza Fresh Toned Milk 500ml"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Amul / Nandini"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bin Location Slot</label>
                  <input
                    type="text"
                    required
                    value={formData.binLocation || ''}
                    onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                    placeholder="e.g. A-02-C1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp || 0}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock on Hand</label>
                  <input
                    type="number"
                    required
                    value={formData.stockOnHand || 0}
                    onChange={(e) => setFormData({ ...formData, stockOnHand: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reorder Threshold Point</label>
                  <input
                    type="number"
                    required
                    value={formData.reorderPoint || 0}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Temperature Zone</label>
                  <select
                    value={formData.temperatureZone}
                    onChange={(e) => setFormData({ ...formData, temperatureZone: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="Ambient">Ambient</option>
                    <option value="Chilled 4°C">Chilled 4°C (Cold Chain)</option>
                    <option value="Frozen -18°C">Frozen -18°C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black shadow-lg shadow-emerald-500/25"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST STOCK MODAL */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-100">Adjust Physical Stock</h3>
                <p className="text-xs text-slate-400 font-mono">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Current System Stock:</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {adjustingProduct.stockOnHand} units
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Verified Physical Count</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Variance:</span>
                  <span
                    className={`font-mono font-bold ${
                      adjustQty - adjustingProduct.stockOnHand < 0
                        ? 'text-rose-400'
                        : adjustQty - adjustingProduct.stockOnHand > 0
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {adjustQty - adjustingProduct.stockOnHand > 0 ? '+' : ''}
                    {adjustQty - adjustingProduct.stockOnHand} units
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                >
                  <option value="CYCLE_COUNT_MISMATCH">Physical Cycle Count Variance</option>
                  <option value="DAMAGE">Damaged in Dark Store</option>
                  <option value="EXPIRY">Expired Product Write-off</option>
                  <option value="PILFERAGE">Missing / Shrinkage</option>
                  <option value="CUSTOMER_RETURN">Customer Return Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supervisor Audit Note</label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Recounted by supervisor on Rack A-02"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black shadow-lg shadow-emerald-500/25"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
