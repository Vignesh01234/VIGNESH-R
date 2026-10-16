import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Database, Printer, Users, UserCheck, 
  Truck, Navigation, IndianRupee, BookOpen, AlertCircle, CheckCircle2, 
  BarChart3, Calendar, Receipt, PieChart, Settings, UserCog, Menu, X, 
  ChevronRight, Building2, Shield, PlusCircle 
} from 'lucide-react';
import type { CompanySettings, LR, User as UserType, Party } from './types/index';
import { api, getActiveUser, setActiveUser } from './services/api';

// Views
import { DashboardView } from './views/DashboardView';
import { CreateLRView } from './views/CreateLRView';
import { LRDatabaseView } from './views/LRDatabaseView';
import { LRPrintReprintView } from './views/LRPrintReprintView';
import { PartyMasterView } from './views/PartyMasterView';
import { FleetAndRouteMasterView } from './views/FleetAndRouteMasterView';
import { PaymentEntryView } from './views/PaymentEntryView';
import { CustomerLedgerView } from './views/CustomerLedgerView';
import { OutstandingReportsView } from './views/OutstandingReportsView';
import { OperationalReportsView } from './views/OperationalReportsView';
import { ExpenseManagementView } from './views/ExpenseManagementView';
import { CompanySettingsView } from './views/CompanySettingsView';
import { UserManagementView } from './views/UserManagementView';
import { LRPrintModal } from './components/LRPrintModal';

export type NavigationMenuKey = 
  | 'dashboard'
  | 'create-lr'
  | 'lr-database'
  | 'print-reprint'
  | 'party-master'
  | 'consignor-consignee'
  | 'vehicle-management'
  | 'driver-management'
  | 'route-master'
  | 'payment-entry'
  | 'customer-ledger'
  | 'topay-outstanding'
  | 'paid-report'
  | 'collection-report'
  | 'daily-report'
  | 'monthly-report'
  | 'expense-management'
  | 'operational-reports'
  | 'company-settings'
  | 'user-management';

export default function App() {
  const [currentView, setCurrentView] = useState<NavigationMenuKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [currentUser, setCurrentUserState] = useState<UserType>(getActiveUser());
  const [editingLR, setEditingLR] = useState<LR | null>(null);
  const [justCreatedLR, setJustCreatedLR] = useState<LR | null>(null);
  const [selectedLedgerParty, setSelectedLedgerParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view: NavigationMenuKey) => {
    if (view === 'create-lr') {
      setEditingLR(null);
    }
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditLR = (lr: LR) => {
    setEditingLR(lr);
    setCurrentView('create-lr');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLRSaved = (savedLR: LR, shouldPrint = false) => {
    if (shouldPrint) {
      setJustCreatedLR(savedLR);
    } else {
      setCurrentView('lr-database');
    }
  };

  const handleViewLedger = (party: Party) => {
    setSelectedLedgerParty(party);
    setCurrentView('customer-ledger');
  };

  const handleUserSwitched = (user: UserType) => {
    setCurrentUserState(user);
    setActiveUser(user);
  };

  // Sidebar Menu Configuration (all 20 menu items)
  const menuSections = [
    {
      title: 'Operations',
      items: [
        { key: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
        { key: 'create-lr', label: '2. Create New LR', icon: PlusCircle, highlight: true },
        { key: 'lr-database', label: '3. LR Database', icon: Database },
        { key: 'print-reprint', label: '4. LR Print & Reprint', icon: Printer },
      ]
    },
    {
      title: 'Master Registries',
      items: [
        { key: 'party-master', label: '5. Customer / Party Master', icon: Users },
        { key: 'consignor-consignee', label: '6. Consignor & Consignee', icon: UserCheck },
        { key: 'vehicle-management', label: '7. Vehicle Management', icon: Truck },
        { key: 'driver-management', label: '8. Driver Management', icon: UserCheck },
        { key: 'route-master', label: '9. City & Route Master', icon: Navigation },
      ]
    },
    {
      title: 'Accounts & Ledger',
      items: [
        { key: 'payment-entry', label: '10. Payment Entry', icon: IndianRupee },
        { key: 'customer-ledger', label: '11. Customer Ledger', icon: BookOpen },
        { key: 'topay-outstanding', label: '12. To Pay Outstanding', icon: AlertCircle },
        { key: 'paid-report', label: '13. Paid LR Report', icon: CheckCircle2 },
        { key: 'collection-report', label: '14. Freight Collection Report', icon: IndianRupee },
      ]
    },
    {
      title: 'Reports & Fleet',
      items: [
        { key: 'daily-report', label: '15. Daily Report', icon: Calendar },
        { key: 'monthly-report', label: '16. Monthly Report', icon: BarChart3 },
        { key: 'expense-management', label: '17. Expense Management', icon: Receipt },
        { key: 'operational-reports', label: '18. Analytics & Reports', icon: PieChart },
      ]
    },
    {
      title: 'Administration',
      items: [
        { key: 'company-settings', label: '19. Company Settings', icon: Settings },
        { key: 'user-management', label: '20. User Management', icon: UserCog },
      ]
    }
  ];

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-black tracking-wider uppercase">Sri Murugan Transport</h2>
        <p className="text-xs text-slate-400 mt-1">Starting full-stack database engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="truncate">
            <span className="font-black text-sm tracking-wide block truncate">
              {settings.companyName || 'SRI MURUGAN TRANSPORT'}
            </span>
            <span className="text-[10px] text-blue-400 block -mt-0.5">Transport Management System</span>
          </div>
        </div>

        <button
          onClick={() => handleNavigate('create-lr')}
          className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-bold text-white shadow-xs"
        >
          + New LR
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Dark Blue / Slate) */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col 
            border-r border-slate-800 transition-transform duration-200 ease-in-out no-print
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo / Company Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-md text-base">
                SMT
              </div>
              <div className="truncate">
                <h1 className="font-black text-sm text-white tracking-wide truncate">
                  {settings.companyName || 'SRI MURUGAN TRANSPORT'}
                </h1>
                <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">
                  Lorry Receipt & Logistics Software
                </p>
              </div>
            </div>
          </div>

          {/* Quick Create LR Primary Button */}
          <div className="p-3 border-b border-slate-800/60">
            <button
              onClick={() => handleNavigate('create-lr')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New LR (F2)</span>
            </button>
          </div>

          {/* Navigation Links Scroll Area */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
            {menuSections.map(sec => (
              <div key={sec.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  {sec.title}
                </div>
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item.key as NavigationMenuKey)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all text-left
                        ${isActive 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : item.highlight
                          ? 'text-blue-300 hover:bg-slate-900 hover:text-white'
                          : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer User Badge */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-blue-400 font-semibold">{currentUser.role}</div>
              </div>
            </div>
            <button
              onClick={() => handleNavigate('user-management')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="User & Role Settings"
            >
              <UserCog className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* MAIN APPLICATION VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-slate-100 flex flex-col">
          {/* Top Bar for Desktop */}
          <div className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 shadow-2xs no-print">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="font-bold text-slate-900 text-sm">
                {menuSections.flatMap(s => s.items).find(i => i.key === currentView)?.label || 'Overview'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Online (Central SQLite)</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('create-lr')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Create LR</span>
              </button>

              <div 
                onClick={() => handleNavigate('user-management')}
                className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-800 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{currentUser.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Views */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {currentView === 'dashboard' && (
              <DashboardView 
                settings={settings}
                currentUser={currentUser.name}
                onNavigate={(v) => handleNavigate(v as NavigationMenuKey)}
                onEditLR={handleEditLR}
              />
            )}

            {currentView === 'create-lr' && (
              <CreateLRView
                initialLR={editingLR}
                settings={settings}
                currentUser={currentUser.name}
                onSaved={handleLRSaved}
                onCancel={() => handleNavigate('lr-database')}
              />
            )}

            {currentView === 'lr-database' && (
              <LRDatabaseView
                settings={settings}
                currentUser={currentUser.name}
                onEditLR={handleEditLR}
                onCreateNewLR={() => handleNavigate('create-lr')}
              />
            )}

            {currentView === 'print-reprint' && (
              <LRPrintReprintView settings={settings} />
            )}

            {currentView === 'party-master' && (
              <PartyMasterView
                settings={settings}
                filterType="All"
                onViewLedger={handleViewLedger}
              />
            )}

            {currentView === 'consignor-consignee' && (
              <PartyMasterView
                settings={settings}
                filterType="Consignor"
                onViewLedger={handleViewLedger}
              />
            )}

            {currentView === 'vehicle-management' && (
              <FleetAndRouteMasterView initialTab="vehicles" />
            )}

            {currentView === 'driver-management' && (
              <FleetAndRouteMasterView initialTab="drivers" />
            )}

            {currentView === 'route-master' && (
              <FleetAndRouteMasterView initialTab="routes" />
            )}

            {currentView === 'payment-entry' && (
              <PaymentEntryView
                settings={settings}
                currentUser={currentUser.name}
              />
            )}

            {currentView === 'customer-ledger' && (
              <CustomerLedgerView
                settings={settings}
                preselectedParty={selectedLedgerParty}
              />
            )}

            {currentView === 'topay-outstanding' && (
              <OutstandingReportsView
                settings={settings}
                currentUser={currentUser.name}
                initialType="topay"
              />
            )}

            {currentView === 'paid-report' && (
              <OutstandingReportsView
                settings={settings}
                currentUser={currentUser.name}
                initialType="paid"
              />
            )}

            {currentView === 'collection-report' && (
              <OutstandingReportsView
                settings={settings}
                currentUser={currentUser.name}
                initialType="collection"
              />
            )}

            {currentView === 'daily-report' && (
              <OperationalReportsView
                settings={settings}
                defaultMode="daily"
              />
            )}

            {currentView === 'monthly-report' && (
              <OperationalReportsView
                settings={settings}
                defaultMode="monthly"
              />
            )}

            {currentView === 'expense-management' && (
              <ExpenseManagementView />
            )}

            {currentView === 'operational-reports' && (
              <OperationalReportsView
                settings={settings}
                defaultMode="route"
              />
            )}

            {currentView === 'company-settings' && (
              <CompanySettingsView
                settings={settings}
                onSettingsUpdated={(up) => setSettings(up)}
              />
            )}

            {currentView === 'user-management' && (
              <UserManagementView
                currentUser={currentUser}
                onUserSwitched={handleUserSwitched}
              />
            )}
          </div>
        </main>
      </div>

      {/* Immediate print preview dialog when "Save & Print" is used */}
      {justCreatedLR && (
        <LRPrintModal
          lr={justCreatedLR}
          settings={settings}
          onClose={() => {
            setJustCreatedLR(null);
            setCurrentView('lr-database');
          }}
        />
      )}
    </div>
  );
}
