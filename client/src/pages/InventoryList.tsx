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
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category, TemperatureZone } from '../types';

export const InventoryList: React.FC = () => {
  const { products, saveProduct, deleteProduct, adjustStock, openScanner, addToast } = useStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'stock-asc' | 'stock-desc' | 'expiry-soon' | 'name-asc'>('stock-asc');

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
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct(formData, !!editingProduct, editingProduct?.id);
      setIsAddEditModalOpen(false);
    } catch (err) {}
  };

  const openAdjustModal = (prod: Product) => {
    setAdjustingProduct(prod);
    setAdjustQty(prod.stockOnHand);
    setAdjustReason('CYCLE_COUNT_MISMATCH');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    try {
      await adjustStock(adjustingProduct.id, adjustQty, adjustReason, adjustNotes);
      setIsAdjustModalOpen(false);
    } catch (err) {}
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Dark Store SKU Catalog</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {filteredProducts.length} of {products.length} SKUs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock on hand, bin coordinates, safety thresholds & batch tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
          >
            <Barcode className="w-4 h-4 text-pink-400" />
            <span>Barcode Scan</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Product Name, Barcode, Bin (e.g. COLD-01, Amul, 890126)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>

          {/* Quick Status Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'LOW_STOCK', label: '⚠️ Low Stock' },
              { id: 'OUT_OF_STOCK', label: '🚫 Out of Stock' },
              { id: 'EXPIRING_SOON', label: '⏳ Near Expiry' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  statusFilter === st.id
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Temperature Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-pink-500"
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
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-pink-500"
          >
            <option value="stock-asc">Sort: Stock (Low to High)</option>
            <option value="stock-desc">Sort: Stock (High to Low)</option>
            <option value="expiry-soon">Sort: Expiry (Soonest First)</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
          </select>
        </div>

        {/* Category Carousel Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SKU Table */}
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
                    {/* Item & SKU info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 truncate group-hover:text-pink-300 transition">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span className="text-pink-400 font-semibold">{p.sku}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{p.unit}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bin Location */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-black text-slate-200">
                        {p.binLocation}
                      </span>
                    </td>

                    {/* Zone */}
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

                    {/* Stock on Hand & Progress bar */}
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

                    {/* Pricing */}
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-slate-200">₹{p.sellingPrice}</div>
                      <div className="text-[10px] text-slate-500 line-through">MRP: ₹{p.mrp}</div>
                    </td>

                    {/* FEFO Expiry */}
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAdjustModal(p)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition"
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
                            if (window.confirm(`Delete SKU ${p.name}?`)) {
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

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Stock Level Reconciliation</h3>
                <p className="text-xs text-slate-400">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Current Count on Hand: <strong className="text-slate-200 font-mono">{adjustingProduct.stockOnHand}</strong>
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="CYCLE_COUNT_MISMATCH">Physical Cycle Count Difference</option>
                  <option value="DAMAGE">Damaged / Leaked Item Write-Off</option>
                  <option value="EXPIRY">Expired Stock Disposal (FEFO)</option>
                  <option value="PILFERAGE">Shrinkage / Missing Item</option>
                  <option value="CUSTOMER_RETURN">Customer Return Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Audit Notes</label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Optional notes for manager audit trail..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">
                {editingProduct ? 'Edit Dark Store SKU' : 'Add New SKU to Dark Store'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amul Taaza Toned Milk"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="Dairy & Breakfast">Dairy & Breakfast</option>
                    <option value="Fresh Fruits & Veg">Fresh Fruits & Veg</option>
                    <option value="Cold Beverages">Cold Beverages</option>
                    <option value="Instant & Snacks">Instant & Snacks</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household & Cleaning">Household & Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Amul, Cadbury, FarmFresh"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Dark Store Bin Location</label>
                  <input
                    type="text"
                    required
                    value={formData.binLocation || ''}
                    onChange={(e) => setFormData({ ...formData, binLocation: e.target.value.toUpperCase() })}
                    placeholder="e.g. COLD-01-A, A-02-B1"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Temperature Zone</label>
                  <select
                    value={formData.temperatureZone}
                    onChange={(e) => setFormData({ ...formData, temperatureZone: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="Ambient">Ambient</option>
                    <option value="Chilled 4°C">Chilled 4°C (Walk-in Chiller)</option>
                    <option value="Frozen -18°C">Frozen -18°C (Deep Freeze)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit / Pack Size</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 500g, 1L, Pack of 4"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice || ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.mrp || ''}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Stock on Hand</label>
                  <input
                    type="number"
                    required
                    value={formData.stockOnHand ?? ''}
                    onChange={(e) => setFormData({ ...formData, stockOnHand: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={formData.reorderPoint || ''}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expiry Date (FEFO)</label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold shadow-lg shadow-pink-600/30"
                >
                  Save SKU to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
