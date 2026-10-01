import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  FolderPlus, 
  FileText,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Building,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';

export default function ClientsView({ 
  clients, 
  onSelectClient, 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient, 
  onSelectProject, 
  onOpenCreateProject 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);

  // New Client Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Mumbai',
    notes: ''
  });

  // Edit Client Form
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Mumbai',
    notes: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide at least Name and Phone number');
      return;
    }
    onAddClient({
      ...formData,
      whatsapp: formData.whatsapp || formData.phone
    });
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: 'Mumbai',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleStartEdit = (client) => {
    setEditFormData({
      name: client.name || '',
      phone: client.phone || '',
      whatsapp: client.whatsapp || client.phone || '',
      email: client.email || '',
      address: client.address || '',
      city: client.city || 'Mumbai',
      notes: client.notes || ''
    });
    setEditingClient(client);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.phone) {
      alert('Please provide at least Name and Phone number');
      return;
    }
    if (onUpdateClient && editingClient) {
      await onUpdateClient(editingClient.id, {
        ...editFormData,
        whatsapp: editFormData.whatsapp || editFormData.phone
      });
      // Also update selectedClientDetail if it's currently open
      if (selectedClientDetail && selectedClientDetail.id === editingClient.id) {
        setSelectedClientDetail(prev => ({
          ...prev,
          ...editFormData
        }));
      }
    }
    setEditingClient(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient || !onDeleteClient) return;
    const cid = deletingClient.id;
    await onDeleteClient(cid);
    if (selectedClientDetail && selectedClientDetail.id === cid) {
      setSelectedClientDetail(null);
    }
    setDeletingClient(null);
  };

  const handleClientClick = async (client) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`);
      const data = await res.json();
      setSelectedClientDetail(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Client Management</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Total {clients.length} {clients.length === 1 ? 'client' : 'clients'} registered across Mumbai & Thane
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap touch-manipulation border border-amber-300/40"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span className="hidden xs:inline">Add Client</span>
          </button>
        </div>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-amber-500/20 p-12 text-center text-xs text-slate-500">
            No clients found matching your search.
          </div>
        ) : (
          filteredClients.map((client) => {
            const projectCount = client.projects_count ?? (client.projects ? client.projects.length : 0);
            const rawPhone = (client.whatsapp || client.phone || '').replace(/\D/g, '');
            const waLink = rawPhone ? `https://wa.me/91${rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone}` : null;

            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-amber-500/25 p-4 sm:p-5 shadow-[0_4px_25px_rgba(217,119,6,0.06)] hover:border-amber-500/40 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Client info + quick actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0 font-display">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">{client.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{client.city || 'Mumbai'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                            <Building className="w-2.5 h-2.5 text-amber-600" />
                            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit and Delete Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(client);
                        }}
                        title="Edit Client"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingClient(client);
                        }}
                        title="Delete Client"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${client.phone}`} className="hover:text-blue-600 hover:underline">
                        {client.phone}
                      </a>
                    </div>
                    {client.whatsapp && waLink && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-700 hover:underline font-medium flex items-center gap-1"
                        >
                          <span>WA: {client.whatsapp}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${client.email}`} className="truncate hover:text-blue-600">
                          {client.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {client.notes && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 italic border border-slate-100">
                      "{client.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleClientClick(client)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 py-1.5 px-2 rounded-lg hover:bg-blue-50 transition touch-manipulation"
                  >
                    View History &rarr;
                  </button>
                  <button
                    onClick={() => onOpenCreateProject(client.id)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl transition touch-manipulation"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Project</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClientDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{selectedClientDetail.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedClientDetail.phone} • {selectedClientDetail.city || 'Mumbai'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    handleStartEdit(selectedClientDetail);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit Client"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeletingClient(selectedClientDetail);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedClientDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Projects & Quotations ({selectedClientDetail.projects?.length || 0})
                </h4>
                <button
                  onClick={() => {
                    const cid = selectedClientDetail.id;
                    setSelectedClientDetail(null);
                    onOpenCreateProject(cid);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-2.5 py-1.5 rounded-xl transition shadow-xs"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Project</span>
                </button>
              </div>

              {selectedClientDetail.projects && selectedClientDetail.projects.length > 0 ? (
                selectedClientDetail.projects.map((proj) => (
                  <div key={proj.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.name}</span>
                        <span className="ml-2 text-[10px] sm:text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          {proj.property_type}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {proj.status}
                      </span>
                    </div>

                    {proj.quotations && proj.quotations.length > 0 && (
                      <div className="pl-3 border-l-2 border-blue-400 space-y-2 text-xs">
                        <div className="font-semibold text-slate-600 text-[11px]">Quotations:</div>
                        {proj.quotations.map((q) => (
                          <div key={q.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-800">{q.quotation_number}</span>
                              <span className="text-slate-500 ml-1">({q.version})</span>
                            </div>
                            <span className="font-bold text-blue-600">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedClientDetail(null);
                          onSelectProject(proj.id);
                        }}
                        className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition"
                      >
                        Open Workspace &rarr;
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <p className="text-xs text-slate-500">No projects created for this client yet.</p>
                  <button
                    onClick={() => {
                      const cid = selectedClientDetail.id;
                      setSelectedClientDetail(null);
                      onOpenCreateProject(cid);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl transition shadow-xs"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create First Project for {selectedClientDetail.name}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Add New Client</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Same as phone"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Kalyan / Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Society</label>
                <input
                  type="text"
                  placeholder="e.g. Godrej Riverside, Khadakpada"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 2BHK renovation, prefers minimalist neutral palette..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                ></textarea>
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Edit Client</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Same as phone"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Society</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Notes</label>
                <textarea
                  rows="2"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Client Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-center text-base sm:text-lg">Delete Client?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">{deletingClient.name}</strong>?
              All associated projects, BOQs, quotations, and follow-up reminders will be permanently removed.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="w-full py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold text-xs shadow-xs"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
