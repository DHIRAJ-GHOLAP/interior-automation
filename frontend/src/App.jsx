import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import ClientsView from './components/ClientsView.jsx';
import ProjectsView from './components/ProjectsView.jsx';
import MaterialsView from './components/MaterialsView.jsx';
import QuotationsView from './components/QuotationsView.jsx';
import FollowUpsView from './components/FollowUpsView.jsx';
import ClientPortalView from './components/ClientPortalView.jsx';
import WhatsAppSimulator from './components/WhatsAppSimulator.jsx';
import StudioSettingsModal from './components/StudioSettingsModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dueFollowups, setDueFollowups] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [portalToken, setPortalToken] = useState(null);
  const [prefilledClientId, setPrefilledClientId] = useState(null);
  const [autoOpenProjectModal, setAutoOpenProjectModal] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [user, setUser] = useState(null);
  const [showStudioModal, setShowStudioModal] = useState(false);

  const [isDirectClientView, setIsDirectClientView] = useState(false);

  // Check URL on load (e.g. if accessed directly at /quote/:token)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/quote/')) {
      const token = path.replace('/quote/', '').trim();
      if (token) {
        setPortalToken(token);
        setIsDirectClientView(true);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const [resClients, resProjects, resMaterials, resQuotes, resAnalytics, resToday] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/projects'),
        fetch('/api/materials'),
        fetch('/api/quotations'),
        fetch('/api/analytics/dashboard'),
        fetch('/api/followups/today')
      ]);

      const [cData, pData, mData, qData, aData, tData] = await Promise.all([
        resClients.json(),
        resProjects.json(),
        resMaterials.json(),
        resQuotes.json(),
        resAnalytics.json(),
        resToday.json()
      ]);

      setClients(cData);
      setProjects(pData);
      setMaterials(mData);
      setQuotations(qData);
      setAnalytics(aData);
      setDueFollowups(tData?.due_today || []);

      if (pData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pData[0].id);
      }
    } catch (e) {
      console.error('Error fetching data', e);
    }
  };

  const fetchAuthProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
      }
    } catch (e) {
      console.error('Error fetching auth profile', e);
    }
  };

  const handleUpdateTenant = async (tenantData) => {
    try {
      const res = await fetch('/api/auth/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });
      const data = await res.json();
      setTenant(data.tenant);
      return data.tenant;
    } catch (e) {
      console.error('Error updating tenant', e);
      alert('Error updating studio settings: ' + e.message);
      throw e;
    }
  };

  useEffect(() => {
    fetchData();
    fetchAuthProfile();
  }, []);

  // Handlers
  const handleAddClient = async (clientData) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      const newClient = await res.json();
      await fetchData();
      return newClient;
    } catch (e) {
      console.error(e);
      alert('Error adding client: ' + e.message);
    }
  };

  const handleUpdateClient = async (clientId, clientData) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      const updated = await res.json();
      await fetchData();
      return updated;
    } catch (e) {
      console.error(e);
      alert('Error updating client: ' + e.message);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 404) {
        throw new Error('Failed to delete client');
      }
      await fetchData();
      return true;
    } catch (e) {
      console.error(e);
      await fetchData();
      alert('Error deleting client: ' + e.message);
      return false;
    }
  };

  const handleCreateProject = async (projData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projData)
      });
      const newProj = await res.json();
      await fetchData();
      setSelectedProjectId(newProj.id);
      setActiveTab('projects');
      return newProj;
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMaterial = async (matData) => {
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matData)
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE'
      });
      if (res.ok || res.status === 404) {
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to delete material');
      }
    } catch (e) {
      console.error(e);
      await fetchData();
      alert('Error deleting material');
    }
  };

  const handleGenerateQuotation = async (quoteData) => {
    try {
      const res = await fetch('/api/quotations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      const quote = await res.json();
      await fetchData();
      setActiveTab('quotations');
      return quote;
    } catch (e) {
      console.error(e);
      alert('Error generating quotation: ' + e.message);
    }
  };

  const handleCreateRevision = async (quotationId) => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}/revision`, {
        method: 'POST'
      });
      const rev = await res.json();
      await fetchData();
      return rev;
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? All associated rooms, BOQ items, and quotations will be removed.')) return false;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 404) throw new Error('Failed to delete project');
      await fetchData();
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      return true;
    } catch (e) {
      console.error(e);
      await fetchData();
      alert('Error deleting project: ' + e.message);
      return false;
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return false;
    try {
      const res = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 404) throw new Error('Failed to delete quotation');
      await fetchData();
      return true;
    } catch (e) {
      console.error(e);
      await fetchData();
      alert('Error deleting quotation: ' + e.message);
      return false;
    }
  };

  // Open default portal view using the first available quotation
  const handleOpenDefaultPortal = () => {
    if (quotations.length > 0) {
      setPortalToken(quotations[0].public_token);
    } else {
      alert('Please create a quotation first to view the client portal.');
    }
  };

  // Direct standalone client view (opened from WhatsApp/link directly by a homeowner)
  if (isDirectClientView && portalToken) {
    return (
      <ClientPortalView
        publicToken={portalToken}
        onClose={null}
        onResponseSuccess={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueFollowupsCount={dueFollowups.length}
        openPortalModal={handleOpenDefaultPortal}
        tenant={tenant}
        user={user}
        onOpenStudioSettings={() => setShowStudioModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            followupsDue={dueFollowups}
            onSelectQuotation={(id) => {
              setActiveTab('quotations');
            }}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            onSelectClient={(c) => {}}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onSelectProject={(projId) => {
              setSelectedProjectId(projId);
              setActiveTab('projects');
            }}
            onOpenCreateProject={(clientId) => {
              setPrefilledClientId(clientId);
              setAutoOpenProjectModal(true);
              setActiveTab('projects');
            }}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            clients={clients}
            materials={materials}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onGenerateQuotation={handleGenerateQuotation}
            autoOpenCreateModal={autoOpenProjectModal}
            prefilledClientId={prefilledClientId}
            onClearAutoOpen={() => {
              setAutoOpenProjectModal(false);
              setPrefilledClientId(null);
            }}
            onRefreshProjects={fetchData}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {activeTab === 'quotations' && (
          <QuotationsView
            quotations={quotations}
            onSelectQuotation={() => {}}
            onCreateRevision={handleCreateRevision}
            onDeleteQuotation={handleDeleteQuotation}
            onOpenClientPortal={(token) => setPortalToken(token)}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'followups' && (
          <FollowUpsView
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'whatsapp_ai' && (
          <WhatsAppSimulator
            clients={clients}
            quotations={quotations}
            onRefresh={fetchData}
          />
        )}
      </main>

      {/* Public Client Transparency Portal Modal */}
      {portalToken && (
        <ClientPortalView
          publicToken={portalToken}
          onClose={() => setPortalToken(null)}
          onResponseSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* Studio Profile & SaaS Settings Modal */}
      {showStudioModal && (
        <StudioSettingsModal
          tenant={tenant}
          onSave={handleUpdateTenant}
          onClose={() => setShowStudioModal(false)}
        />
      )}

      {/* Luxury Footer */}
      <footer className="bg-[#090d16] border-t border-amber-500/20 py-4 text-center text-xs text-amber-200/60 font-serif tracking-wider">
        <span className="text-amber-300 font-bold">{tenant?.name || 'More Construction and Interior'}</span> • Bespoke Architectural & Interior Automation Platform
      </footer>
    </div>
  );
}
