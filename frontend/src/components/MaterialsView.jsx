import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  IndianRupee, 
  Percent, 
  ShieldCheck, 
  Tag,
  Filter,
  X,
  Trash2
} from 'lucide-react';

export default function MaterialsView({ materials, onAddMaterial, onDeleteMaterial }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Plywood',
    brand: '',
    material_type: '',
    grade: '',
    thickness: '18mm',
    unit: 'SQFT',
    purchase_cost: 0,
    client_rate: 0,
    default_wastage_percent: 10.0,
    notes: ''
  });

  const categories = [
    'ALL',
    'Civil & Structural',
    'Masonry & Bricks',
    'Plaster & Gypsum',
    'Waterproofing',
    'Flooring & Tiling',
    'Plumbing & Sanitary',
    'Electrical',
    'Paint',
    'False Ceiling',
    'Plywood',
    'Laminate',
    'Acrylic',
    'Veneer',
    'Glass',
    'Edge Band',
    'Hardware'
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.brand && m.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.client_rate <= 0) {
      alert('Please provide a valid material name and client rate.');
      return;
    }
    onAddMaterial({
      ...formData,
      purchase_cost: parseFloat(formData.purchase_cost) || 0,
      client_rate: parseFloat(formData.client_rate) || 0,
      default_wastage_percent: parseFloat(formData.default_wastage_percent) || 0
    });
    setFormData({
      name: '',
      category: 'Plywood',
      brand: '',
      material_type: '',
      grade: '',
      thickness: '18mm',
      unit: 'SQFT',
      purchase_cost: 0,
      client_rate: 0,
      default_wastage_percent: 10.0,
      notes: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-tight">Materials Database & Specifications</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Configure purchase costs, client selling rates, and wastage margins</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs touch-manipulation border border-amber-300/40"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-amber-500/20 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search material, brand, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-amber-50/50 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">Internal purchase costs are 100% private from clients</span>
          </div>
        </div>

        {/* Category Pills (Touch Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition touch-manipulation text-[11px] sm:text-xs ${
                selectedCategory === cat
                  ? 'bg-[#090d16] text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View (iPhone 15 Optimized) */}
      <div className="sm:hidden space-y-3">
        {filteredMaterials.map((m) => {
          const margin = (m.client_rate || 0) - (m.purchase_cost || 0);
          const marginPct = m.client_rate > 0 ? Math.round((margin / m.client_rate) * 100) : 0;

          return (
            <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                    {m.brand && <span>Brand: {m.brand}</span>}
                    {m.thickness && <span>• {m.thickness}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {m.category}
                  </span>
                  <button
                    onClick={() => onDeleteMaterial && onDeleteMaterial(m.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-lg transition touch-manipulation text-[11px] font-semibold border border-rose-100"
                    title="Remove Material"
                    aria-label="Remove Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Cost Rate</div>
                  <div className="font-mono text-slate-600 font-semibold">₹{m.purchase_cost}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[9px] uppercase font-bold text-blue-600">Client Rate</div>
                  <div className="font-mono font-bold text-blue-600">₹{m.client_rate}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-emerald-600">Margin</div>
                  <div className="font-mono font-bold text-emerald-600">+{marginPct}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Unit: <strong className="text-slate-700 font-mono">{m.unit}</strong></span>
                <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.2 rounded-full">
                  Wastage: +{m.default_wastage_percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet & Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Material & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Spec / Thickness</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Purchase Cost (₹)</th>
                <th className="py-3 px-4 text-right">Client Rate (₹)</th>
                <th className="py-3 px-4 text-right">Margin (₹)</th>
                <th className="py-3 px-4 text-center">Wastage %</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((m) => {
                const margin = (m.client_rate || 0) - (m.purchase_cost || 0);
                const marginPct = m.client_rate > 0 ? Math.round((margin / m.client_rate) * 100) : 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                      {m.brand && (
                        <div className="text-[11px] text-slate-500 font-medium">Brand: {m.brand}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.thickness || m.grade || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {m.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      ₹{m.purchase_cost?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 text-sm">
                      ₹{m.client_rate?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-emerald-600">₹{margin.toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">({marginPct}%)</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                        +{m.default_wastage_percent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteMaterial && onDeleteMaterial(m.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-lg transition font-medium text-xs border border-rose-100"
                        title="Delete Material"
                        aria-label="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Add Material to Catalogue</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18mm BWP Plywood 710"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Century, Merino, etc."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Spec</label>
                  <input
                    type="text"
                    placeholder="18mm"
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="SQFT">SQFT (Square Feet)</option>
                    <option value="RUNNING_FT">RUNNING_FT (Running Feet)</option>
                    <option value="CFT">CFT (Cubic Feet)</option>
                    <option value="BRASS">BRASS (100 CFT)</option>
                    <option value="BAG">BAG (50kg / 40kg)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="TON">TON (Metric Ton)</option>
                    <option value="PIECE">PIECE (Nos)</option>
                    <option value="SET">SET (Fixtures)</option>
                    <option value="LOT">LOT (Lump-sum)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.default_wastage_percent}
                    onChange={(e) => setFormData({ ...formData, default_wastage_percent: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="120"
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-700 mb-1">Selling Rate (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="145"
                    value={formData.client_rate}
                    onChange={(e) => setFormData({ ...formData, client_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
