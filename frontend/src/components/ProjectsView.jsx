import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Ruler, 
  Calculator, 
  Layers, 
  IndianRupee, 
  Percent, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  Building,
  User,
  MapPin,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Sparkles,
  X
} from 'lucide-react';

export default function ProjectsView({ 
  projects, 
  clients, 
  materials, 
  selectedProjectId, 
  onSelectProject, 
  onCreateProject, 
  onDeleteProject,
  onGenerateQuotation,
  autoOpenCreateModal,
  prefilledClientId,
  onClearAutoOpen,
  onRefreshProjects
}) {
  const [activeProjDetail, setActiveProjDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('turnkey_villa');
  const [templateForm, setTemplateForm] = useState({
    client_id: '',
    custom_name: '',
    location: '',
    carpet_area: 3450
  });
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(null); // room_id
  const [showAddBOQModal, setShowAddBOQModal] = useState(null); // room_id
  const [showGenerateQuoteModal, setShowGenerateQuoteModal] = useState(false);

  // New Project Form
  const [newProjectForm, setNewProjectForm] = useState({
    client_id: '',
    name: '',
    property_type: '2BHK',
    location: '',
    carpet_area: 0,
    number_of_rooms: 3,
    start_date: '',
    expected_completion: '',
    estimated_budget: 0
  });

  // Room Form
  const [roomName, setRoomName] = useState('');
  const [roomFloor, setRoomFloor] = useState('Ground Floor');

  // Measurement Form
  const [measForm, setMeasForm] = useState({
    label: '',
    height: 8.5,
    width: 10.0,
    length: 0,
    unit: 'FT',
    notes: ''
  });

  // BOQ Item Form
  const [boqForm, setBoqForm] = useState({
    material_id: '',
    item_title: '',
    category: 'Cabinetry',
    calculation_type: 'AREA', // AREA, RUNNING_FT, PIECES, FIXED
    height: 8.5,
    width: 10.0,
    length: 0,
    multiplier: 1.0,
    net_quantity: 0,
    unit: 'SQFT',
    wastage_percent: 10.0,
    purchase_rate: 0,
    client_rate: 0
  });

  // Quotation Generation Form
  const [quoteForm, setQuoteForm] = useState({
    discount_amount: 0,
    tax_percent: 18.0,
    notes: 'Comprehensive turnkey interior proposal.',
    terms: '50% Advance at booking, 40% on material delivery, 10% on handover.'
  });

  // Fetch project details whenever selectedProjectId changes
  const fetchProjectDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setActiveProjDetail(data);
    } catch (e) {
      console.error('Error fetching project detail', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    } else if (projects.length > 0) {
      onSelectProject(projects[0].id);
    }
  }, [selectedProjectId, projects]);

  useEffect(() => {
    if (autoOpenCreateModal) {
      if (prefilledClientId) {
        setNewProjectForm(prev => ({
          ...prev,
          client_id: prefilledClientId
        }));
      }
      setShowAddProjectModal(true);
      if (onClearAutoOpen) {
        onClearAutoOpen();
      }
    }
  }, [autoOpenCreateModal, prefilledClientId]);

  useEffect(() => {
    fetch('/api/projects/templates/catalog')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
          if (data.length > 0) setSelectedTemplateId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleApplyTemplate = async (e) => {
    e.preventDefault();
    const cId = templateForm.client_id || (clients.length > 0 ? clients[0].id : null);
    if (!cId) {
      alert('Please select or add a client first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/projects/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: cId,
          template_id: selectedTemplateId,
          custom_name: templateForm.custom_name,
          location: templateForm.location || 'Mumbai Project Site',
          carpet_area: parseFloat(templateForm.carpet_area) || 0
        })
      });
      const data = await res.json();
      if (data.project_id) {
        setShowTemplateModal(false);
        if (onRefreshProjects) {
          await onRefreshProjects();
        }
        onSelectProject(data.project_id);
      } else {
        alert('Could not provision template: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error applying template: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newProjectForm.name || !newProjectForm.client_id) {
      alert('Please select a client and enter a project name.');
      return;
    }
    const created = await onCreateProject(newProjectForm);
    setShowAddProjectModal(false);
    if (created && created.id) {
      onSelectProject(created.id);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !activeProjDetail) return;
    try {
      await fetch(`/api/projects/${activeProjDetail.id}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: activeProjDetail.id,
          name: roomName,
          floor: roomFloor
        })
      });
      setRoomName('');
      setShowAddRoomModal(false);
      fetchProjectDetails(activeProjDetail.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMeasurement = async (roomId) => {
    try {
      await fetch(`/api/projects/rooms/${roomId}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          ...measForm,
          height: parseFloat(measForm.height) || 0,
          width: parseFloat(measForm.width) || 0,
          length: parseFloat(measForm.length) || 0
        })
      });
      setShowAddMeasurementModal(null);
      setMeasForm({ label: '', height: 8.5, width: 10.0, length: 0, unit: 'FT', notes: '' });
      fetchProjectDetails(activeProjDetail.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMaterialSelectInBOQ = (materialId) => {
    const mat = materials.find(m => m.id === materialId);
    if (mat) {
      let defaultCalcType = 'AREA';
      if (['CFT', 'CUFT', 'CUBIC_FT'].includes(mat.unit)) {
        defaultCalcType = 'VOLUME';
      } else if (mat.unit === 'BRASS') {
        defaultCalcType = 'BRASS';
      } else if (['RUNNING_FT', 'RFT'].includes(mat.unit)) {
        defaultCalcType = 'RUNNING_FT';
      } else if (['PIECE', 'SET', 'BAG', 'KG', 'TON', 'NOS'].includes(mat.unit)) {
        defaultCalcType = 'PIECES';
      } else if (['LOT', 'FIXED'].includes(mat.unit)) {
        defaultCalcType = 'FIXED';
      }

      setBoqForm(prev => ({
        ...prev,
        material_id: materialId,
        item_title: mat.name,
        category: mat.category,
        calculation_type: defaultCalcType,
        unit: mat.unit,
        purchase_rate: mat.purchase_cost,
        client_rate: mat.client_rate,
        wastage_percent: mat.default_wastage_percent
      }));
    } else {
      setBoqForm(prev => ({ ...prev, material_id: '' }));
    }
  };

  const handleAddBOQ = async (roomId) => {
    try {
      await fetch(`/api/projects/rooms/${roomId}/boq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          ...boqForm,
          height: parseFloat(boqForm.height) || 0,
          width: parseFloat(boqForm.width) || 0,
          length: parseFloat(boqForm.length) || 0,
          multiplier: parseFloat(boqForm.multiplier) || 1.0,
          net_quantity: parseFloat(boqForm.net_quantity) || 0,
          wastage_percent: parseFloat(boqForm.wastage_percent) || 0,
          purchase_rate: parseFloat(boqForm.purchase_rate) || 0,
          client_rate: parseFloat(boqForm.client_rate) || 0,
        })
      });
      setShowAddBOQModal(null);
      fetchProjectDetails(activeProjDetail.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBOQ = async (boqId) => {
    if (!confirm('Remove this item from the BOQ?')) return;
    try {
      await fetch(`/api/projects/boq/${boqId}`, { method: 'DELETE' });
      fetchProjectDetails(activeProjDetail.id);
    } catch (e) {
      console.error(e);
      fetchProjectDetails(activeProjDetail.id);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to permanently delete this room and all its measurements and BOQ items?')) return;
    try {
      const res = await fetch(`/api/projects/rooms/${roomId}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        fetchProjectDetails(activeProjDetail.id);
        if (onRefreshProjects) onRefreshProjects();
      }
    } catch (e) {
      console.error(e);
      fetchProjectDetails(activeProjDetail.id);
      alert('Error deleting room: ' + e.message);
    }
  };

  const handleDeleteMeasurement = async (measId) => {
    if (!confirm('Delete this measurement?')) return;
    try {
      const res = await fetch(`/api/projects/measurements/${measId}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        fetchProjectDetails(activeProjDetail.id);
      }
    } catch (e) {
      console.error(e);
      fetchProjectDetails(activeProjDetail.id);
      alert('Error deleting measurement');
    }
  };

  const handleGenerateQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!activeProjDetail) return;
    await onGenerateQuotation({
      project_id: activeProjDetail.id,
      discount_amount: parseFloat(quoteForm.discount_amount) || 0,
      tax_percent: parseFloat(quoteForm.tax_percent) || 18.0,
      notes: quoteForm.notes,
      terms: quoteForm.terms
    });
    setShowGenerateQuoteModal(false);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Project Selector & Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Projects & BOQ Engine</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Live measurements, material specifications, and real-time margin tracking</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Project Dropdown */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => onSelectProject(e.target.value)}
            className="flex-1 sm:flex-none text-xs font-semibold bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.property_type})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap touch-manipulation"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="hidden xs:inline">Turnkey Templates</span>
            <span className="xs:hidden">Templates</span>
          </button>

          <button
            onClick={() => setShowAddProjectModal(true)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Project</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-semibold">Loading project workspace...</div>
      ) : activeProjDetail ? (
        <div className="space-y-5 sm:space-y-6">
          {/* Project Info & Financial Strip */}
          <div className="bg-white rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-[0_4px_25px_rgba(217,119,6,0.06)]">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">{activeProjDetail.name}</h3>
                  <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/25">
                    {activeProjDetail.property_type}
                  </span>
                  <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                    {activeProjDetail.status}
                  </span>
                  {onDeleteProject && (
                    <button
                      onClick={() => onDeleteProject(activeProjDetail.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition active:scale-95 border border-transparent hover:border-rose-200"
                      title="Permanently Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Client: <strong className="text-slate-800">{activeProjDetail.client?.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{activeProjDetail.location || activeProjDetail.client?.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-600" />
                    <span>Carpet: <strong className="text-slate-800">{activeProjDetail.carpet_area} sq.ft</strong></span>
                  </div>
                </div>
              </div>

              {/* Financial Box: Cost, Client Price & Margin */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gradient-to-br from-slate-50 to-amber-50/20 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
                <div className="grid grid-cols-3 gap-2 text-center sm:text-right">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Cost</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 truncate">{formatINR(activeProjDetail.summary?.total_cost)}</div>
                  </div>
                  <div className="border-x border-slate-200 px-2.5">
                    <div className="text-[9px] uppercase font-bold text-amber-700">Proposal Value</div>
                    <div className="text-xs sm:text-base font-bold text-slate-900 truncate font-mono">{formatINR(activeProjDetail.summary?.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-emerald-600">Gross Margin</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-700 truncate font-mono">
                      {formatINR(activeProjDetail.summary?.total_margin)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowGenerateQuoteModal(true)}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold py-2.5 px-4 rounded-xl transition shadow-[0_4px_15px_rgba(217,119,6,0.25)] border border-amber-300/40 touch-manipulation"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Generate Quotation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rooms Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>Rooms & Spaces Breakdown</span>
              <span className="text-xs bg-amber-500/10 text-amber-800 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-semibold">
                {activeProjDetail.rooms?.length || 0}
              </span>
            </h3>
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="flex items-center gap-1 bg-[#090d16] hover:bg-[#131b2e] active:scale-95 text-amber-200 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm border border-amber-500/25 touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Room</span>
            </button>
          </div>

          {/* Room Blocks */}
          <div className="space-y-4 sm:space-y-5">
            {activeProjDetail.rooms && activeProjDetail.rooms.map((room) => {
              const totalRoomMeasurementsSqft = room.measurements?.reduce((acc, m) => acc + (m.calculated_sqft || 0), 0) || 0;

              return (
                <div key={room.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-amber-500/30 transition">
                  {/* Room Header */}
                  <div className="bg-[#090d16] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs font-display">
                        {room.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-amber-50">{room.name}</h4>
                        <div className="text-[10px] sm:text-[11px] text-amber-200/60">{room.floor || 'Floor'} • {room.boq_items?.length || 0} BOQ Items</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t border-slate-800 sm:border-0">
                      <div className="text-left sm:text-right pr-1">
                        <div className="text-[9px] text-amber-200/50 uppercase font-semibold">Total</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                          {formatINR(room.room_amount)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowAddMeasurementModal(room.id)}
                          className="flex items-center gap-1 bg-[#131b2e] hover:bg-[#1a253c] active:scale-95 text-amber-200 text-xs px-2.5 py-1.5 rounded-xl transition touch-manipulation font-semibold border border-amber-500/20"
                        >
                          <Ruler className="w-3.5 h-3.5 text-amber-400" />
                          <span>+ Measure</span>
                        </button>
                        <button
                          onClick={() => setShowAddBOQModal(room.id)}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs px-2.5 py-1.5 rounded-xl transition font-extrabold touch-manipulation shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ BOQ</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 active:scale-95 transition rounded-xl hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30"
                          title="Delete entire room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Measurements Sub-bar */}
                  {room.measurements && room.measurements.length > 0 && (
                    <div className="bg-amber-50/20 border-b border-slate-100 p-3 sm:p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700">
                          <Ruler className="w-3.5 h-3.5 text-amber-600" />
                          <span>Room Dimensions ({totalRoomMeasurementsSqft.toFixed(1)} sq.ft Total)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">Auto-calculated: Height × Width</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {room.measurements.map((m) => (
                          <div key={m.id} className="bg-white px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs flex items-center gap-1.5 shadow-xs">
                            <span className="font-semibold text-slate-800">{m.label}:</span>
                            <span className="text-slate-500 font-mono">{m.height}×{m.width}</span>
                            <span className="bg-amber-500/10 text-amber-800 font-bold px-1.5 py-0.2 rounded text-[10px] sm:text-[11px]">
                              = {m.calculated_sqft} sq.ft
                            </span>
                            <button
                              onClick={() => handleDeleteMeasurement(m.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5 transition"
                              title="Delete measurement"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Touch Cards View for BOQ items (iPhone 15 Optimized) */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {room.boq_items && room.boq_items.length > 0 ? (
                      room.boq_items.map((b) => (
                        <div key={b.id} className="p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{b.item_title}</div>
                              {b.material && (
                                <div className="text-[10px] text-slate-500">{b.material.brand} • {b.material.thickness} {b.material.name}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteBOQ(b.id)}
                              className="text-slate-400 hover:text-rose-600 active:scale-90 p-1 touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-500">Qty (incl. +{b.wastage_percent}%):</span>
                              <div className="font-mono font-bold text-slate-800">{b.chargeable_quantity} {b.unit}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500">Rate:</span>
                              <div className="font-mono font-bold text-blue-600">₹{b.client_rate}/{b.unit}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-emerald-700 font-semibold">Margin: {formatINR(b.gross_margin)}</span>
                            <span className="font-extrabold text-slate-900 text-sm font-mono">{formatINR(b.total_amount)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs italic">
                        No BOQ items added yet. Tap "+ BOQ" above.
                      </div>
                    )}
                  </div>

                  {/* Tablet & Desktop Full Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Item & Spec</th>
                          <th className="py-2.5 px-3">Calc Type</th>
                          <th className="py-2.5 px-3 text-right">Net Qty</th>
                          <th className="py-2.5 px-3 text-center">Wastage</th>
                          <th className="py-2.5 px-3 text-right">Chargeable</th>
                          <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                          <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                          <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                          <th className="py-2.5 px-4 text-right">Margin (₹)</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {room.boq_items && room.boq_items.length > 0 ? (
                          room.boq_items.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{b.item_title}</div>
                                {b.material && (
                                  <div className="text-[11px] text-slate-500">
                                    {b.material.brand} • {b.material.thickness} {b.material.name}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {b.calculation_type}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-600">
                                {b.net_quantity?.toFixed(1)} {b.unit}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                                  +{b.wastage_percent}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                {b.chargeable_quantity?.toFixed(1)} {b.unit}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500">
                                ₹{b.purchase_rate?.toFixed(0)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                                ₹{b.client_rate?.toFixed(0)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                                {formatINR(b.total_amount)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                                {formatINR(b.gross_margin)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleDeleteBOQ(b.id)}
                                  className="text-slate-400 hover:text-rose-600 transition p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="py-6 text-center text-slate-400 italic">
                              No BOQ items added for {room.name} yet. Tap "+ BOQ" to add.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first project to begin logging room measurements and generating instant BOQ estimates.
          </p>
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 shadow"
          >
            + Create Project
          </button>
        </div>
      )}

      {/* Turnkey Construction & Interior Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Turnkey Project & BOQ Templates</h3>
                  <p className="text-[11px] text-slate-500">Instant multi-category construction & interior scope presets</p>
                </div>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyTemplate} className="mt-4 space-y-4 text-xs">
              {/* Template Cards */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Select Turnkey Package</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          if (!templateForm.custom_name) {
                            setTemplateForm(prev => ({
                              ...prev,
                              carpet_area: tpl.typical_area
                            }));
                          }
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{tpl.title}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                {tpl.property_type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.description}</p>
                          </div>
                          <div className="text-right whitespace-nowrap pl-2">
                            <span className="text-xs font-bold text-blue-700 block">
                              {formatINR(tpl.typical_budget)}
                            </span>
                            <span className="text-[10px] text-slate-400">{tpl.typical_area} sq.ft</span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {tpl.rooms.map((r, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                            >
                              ✓ {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Client Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Client *</label>
                <select
                  required
                  value={templateForm.client_id || (clients.length > 0 ? clients[0].id : '')}
                  onChange={(e) => setTemplateForm({ ...templateForm, client_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city || 'Client'})</option>
                  ))}
                </select>
              </div>

              {/* Project Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Alibaug Beach Villa"
                    value={templateForm.custom_name}
                    onChange={(e) => setTemplateForm({ ...templateForm, custom_name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Khandala / Bandra"
                    value={templateForm.location}
                    onChange={(e) => setTemplateForm({ ...templateForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carpet Area (sq.ft)</label>
                <input
                  type="number"
                  placeholder="3450"
                  value={templateForm.carpet_area}
                  onChange={(e) => setTemplateForm({ ...templateForm, carpet_area: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Provision Turnkey Project with BOQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal (iPhone 15 Safe) */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Create New Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProjectSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client *</label>
                <select
                  required
                  value={newProjectForm.client_id}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, client_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2BHK Kalyan Interior"
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={newProjectForm.property_type}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, property_type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1BHK">1BHK Apartment</option>
                    <option value="2BHK">2BHK Apartment</option>
                    <option value="3BHK">3BHK Apartment</option>
                    <option value="4BHK">4BHK Luxury Apartment</option>
                    <option value="Villa">Villa / Independent Bungalow</option>
                    <option value="Turnkey Construction">Turnkey EPC Construction</option>
                    <option value="Civil & Structural">Civil & Structural Works</option>
                    <option value="Full Home Renovation">Full Home Renovation</option>
                    <option value="Office">Commercial Office Fitout</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carpet (sq.ft)</label>
                  <input
                    type="number"
                    placeholder="750"
                    value={newProjectForm.carpet_area}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, carpet_area: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kalyan West"
                  value={newProjectForm.location}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base mb-3">Add Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Floor Level</label>
                <input
                  type="text"
                  placeholder="Ground Floor"
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {showAddMeasurementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Enter Measurement</h3>
              </div>
              <button onClick={() => setShowAddMeasurementModal(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wall / Area Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wall A (Wardrobe Wall)"
                  value={measForm.label}
                  onChange={(e) => setMeasForm({ ...measForm, label: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Height (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measForm.height}
                    onChange={(e) => setMeasForm({ ...measForm, height: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Width (ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measForm.width}
                    onChange={(e) => setMeasForm({ ...measForm, width: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Instant Calculation Preview */}
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-blue-800 font-semibold">Calculated Area:</span>
                <span className="text-base sm:text-lg font-bold text-blue-700 font-mono">
                  {((parseFloat(measForm.height) || 0) * (parseFloat(measForm.width) || 0)).toFixed(2)} sq.ft
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMeasurementModal(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMeasurement(showAddMeasurementModal)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Save Measurement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add BOQ Modal */}
      {showAddBOQModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Item to Room BOQ</h3>
              </div>
              <button onClick={() => setShowAddBOQModal(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pick Material from Catalogue</label>
                <select
                  value={boqForm.material_id}
                  onChange={(e) => handleMaterialSelectInBOQ(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Material or Custom Item --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.category}: {m.name} — Client: ₹{m.client_rate}/{m.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Base Cabinets (18mm BWP Plywood)"
                  value={boqForm.item_title}
                  onChange={(e) => setBoqForm({ ...boqForm, item_title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculation Method</label>
                  <select
                    value={boqForm.calculation_type}
                    onChange={(e) => setBoqForm({ ...boqForm, calculation_type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="AREA">Area (Height × Width) [SQFT]</option>
                    <option value="RUNNING_FT">Running Feet (Length) [RFT]</option>
                    <option value="VOLUME">Volume 3D (L × W × H) [CFT / Cu.M]</option>
                    <option value="BRASS">Brass Volume (L × W × H ÷ 100) [BRASS]</option>
                    <option value="PIECES">Piece / Unit / Bag / KG Count</option>
                    <option value="FIXED">Fixed Lump-sum / Turnkey Lot</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={boqForm.unit}
                    onChange={(e) => setBoqForm({ ...boqForm, unit: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {boqForm.calculation_type === 'AREA' && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Height (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.height}
                      onChange={(e) => setBoqForm({ ...boqForm, height: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Width (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.width}
                      onChange={(e) => setBoqForm({ ...boqForm, width: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Multiplier</label>
                    <input
                      type="number"
                      value={boqForm.multiplier}
                      onChange={(e) => setBoqForm({ ...boqForm, multiplier: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {(boqForm.calculation_type === 'VOLUME' || boqForm.calculation_type === 'BRASS') && (
                <div className="grid grid-cols-4 gap-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                  <div>
                    <label className="block font-semibold text-blue-900 mb-1">Length (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.length}
                      onChange={(e) => setBoqForm({ ...boqForm, length: e.target.value })}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-900 mb-1">Width (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.width}
                      onChange={(e) => setBoqForm({ ...boqForm, width: e.target.value })}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-900 mb-1">Depth/H (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.height}
                      onChange={(e) => setBoqForm({ ...boqForm, height: e.target.value })}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-900 mb-1">Multiplier</label>
                    <input
                      type="number"
                      value={boqForm.multiplier}
                      onChange={(e) => setBoqForm({ ...boqForm, multiplier: e.target.value })}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {boqForm.calculation_type === 'RUNNING_FT' && (
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Length (Running Ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.length}
                      onChange={(e) => setBoqForm({ ...boqForm, length: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Multiplier</label>
                    <input
                      type="number"
                      value={boqForm.multiplier}
                      onChange={(e) => setBoqForm({ ...boqForm, multiplier: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {(boqForm.calculation_type === 'PIECES' || boqForm.calculation_type === 'FIXED') && (
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Quantity / Count</label>
                    <input
                      type="number"
                      step="0.1"
                      value={boqForm.net_quantity}
                      onChange={(e) => setBoqForm({ ...boqForm, net_quantity: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Multiplier</label>
                    <input
                      type="number"
                      value={boqForm.multiplier}
                      onChange={(e) => setBoqForm({ ...boqForm, multiplier: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={boqForm.wastage_percent}
                    onChange={(e) => setBoqForm({ ...boqForm, wastage_percent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Rate (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={boqForm.purchase_rate}
                    onChange={(e) => setBoqForm({ ...boqForm, purchase_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-700 mb-1">Client Rate (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={boqForm.client_rate}
                    onChange={(e) => setBoqForm({ ...boqForm, client_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Real-time Math Preview */}
              {(() => {
                const net = boqForm.calculation_type === 'AREA'
                  ? (parseFloat(boqForm.height) || 0) * (parseFloat(boqForm.width) || 0) * (parseFloat(boqForm.multiplier) || 1)
                  : (parseFloat(boqForm.net_quantity) || 0) * (parseFloat(boqForm.multiplier) || 1);
                const wastage = parseFloat(boqForm.wastage_percent) || 0;
                const chargeable = net * (1 + wastage / 100);
                const clientRate = parseFloat(boqForm.client_rate) || 0;
                const purchaseRate = parseFloat(boqForm.purchase_rate) || 0;
                const totalAmt = chargeable * clientRate;
                const totalCost = chargeable * purchaseRate;
                const margin = totalAmt - totalCost;

                return (
                  <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Chargeable Qty</span>
                      <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{chargeable.toFixed(1)} {boqForm.unit}</div>
                    </div>
                    <div className="border-x border-blue-200 px-1">
                      <span className="text-[10px] text-blue-700 uppercase font-semibold">Client Total</span>
                      <div className="font-mono font-bold text-blue-700 text-xs sm:text-sm">{formatINR(totalAmt)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 uppercase font-semibold">Margin</span>
                      <div className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{formatINR(margin)}</div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBOQModal(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBOQ(showAddBOQModal)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Save to BOQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quotation Modal */}
      {showGenerateQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Generate Quotation</h3>
              <button onClick={() => setShowGenerateQuoteModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuoteSubmit} className="mt-4 space-y-3 text-xs">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                <div className="text-blue-800 font-medium">BOQ Subtotal:</div>
                <div className="text-xl font-bold text-blue-900">{formatINR(activeProjDetail.summary?.total_amount)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={quoteForm.discount_amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discount_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Tax %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quoteForm.tax_percent}
                    onChange={(e) => setQuoteForm({ ...quoteForm, tax_percent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposal Scope Notes</label>
                <textarea
                  rows="2"
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateQuoteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 font-bold shadow-md"
                >
                  Confirm & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
