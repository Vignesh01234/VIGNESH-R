import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Database, Printer, Users, UserCheck, 
  Truck, Navigation, IndianRupee, BookOpen, AlertCircle, CheckCircle2, 
  BarChart3, Calendar, Receipt, PieChart, Settings, UserCog, Menu, X, 
  ChevronRight, Building2, Shield, PlusCircle, Laptop, HardDrive, 
  LogOut, Download, Monitor, Power 
} from 'lucide-react';
import type { CompanySettings, LR, User as UserType, Party } from './types/index';
import { api, getActiveUser, setActiveUser, isAuthenticated, logoutUser } from './services/api';

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
import { TransportLogo } from './components/TransportLogo';
import { LoginScreen } from './components/LoginScreen';
import { OfflineBackupPromptModal } from './components/OfflineBackupPromptModal';
import { DesktopInstallModal } from './components/DesktopInstallModal';

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
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated());
  const [currentView, setCurrentView] = useState<NavigationMenuKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [currentUser, setCurrentUserState] = useState<UserType>(getActiveUser());
  const [editingLR, setEditingLR] = useState<LR | null>(null);
  const [justCreatedLR, setJustCreatedLR] = useState<LR | null>(null);
  const [selectedLedgerParty, setSelectedLedgerParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

  // Offline Modals
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [isLogoutAction, setIsLogoutAction] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    loadSettings();

    // Hook beforeunload to prevent accidental tab closing without backup if enabled
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard browser prompt to notify the user
      e.preventDefault();
      e.returnValue = 'Do you want to backup your local database before closing Sri Murugan Transport?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

  const handleTriggerLogout = () => {
    setIsLogoutAction(true);
    setShowBackupPrompt(true);
  };

  const handleTriggerCloseApp = () => {
    setIsLogoutAction(false);
    setShowBackupPrompt(true);
  };

  const handleConfirmExitOrLogout = () => {
    setShowBackupPrompt(false);
    if (isLogoutAction) {
      logoutUser();
      setIsAuth(false);
    }
  };

  // If not authenticated, require offline login
  if (!isAuth) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUserState(user);
            setIsAuth(true);
          }}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />
        {showInstallModal && (
          <DesktopInstallModal onClose={() => setShowInstallModal(false)} />
        )}
      </>
    );
  }

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
      title: 'Management Reports',
      items: [
        { key: 'daily-report', label: '15. Daily Report', icon: Calendar },
        { key: 'monthly-report', label: '16. Monthly Report', icon: BarChart3 },
        { key: 'expense-management', label: '17. Expense Management', icon: Receipt },
        { key: 'operational-reports', label: '18. Analytics & Reports', icon: PieChart },
      ]
    },
    {
      title: 'System & Admin',
      items: [
        { key: 'company-settings', label: '19. Company Settings', icon: Settings },
        { key: 'user-management', label: '20. User Management', icon: UserCog },
      ]
    }
  ];

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <TransportLogo size="lg" />
          <h2 className="text-xl font-bold tracking-wide">SRI MURUGAN TRANSPORT</h2>
          <p className="text-xs text-blue-400 animate-pulse">Loading offline local database...</p>
        </div>
      </div>
    );
  }

  const safeSettings = settings || {
    companyName: 'SRI MURUGAN TRANSPORT',
    address: 'No. 14, Trunk Road, Ranipet, Tamil Nadu - 632401',
    phone: '04172-272345 / 9444012345',
    email: 'bookings@srimurugantransport.com',
    gstin: '33AAAFS1234E1Z5',
    lrPrefix: 'SMT-2026-',
    nextLrNumber: 1,
    defaultPaymentType: 'To Pay',
    defaultPrintCopy: 'All 4 Copies',
    declaration: 'Carriage under owner\'s risk. Complaints within 48 hours.',
    defaultWeightUnit: 'kg',
    gstEnabled: false,
    defaultGstRate: 5,
    taxCalculationBasis: 'freight',
    currencySymbol: '₹',
    printLayout: 'landscape',
    printPaperSize: 'A4',
    printCopiesPerSheet: '1',
    tagline: 'Prompt, Safe & Reliable Daily Cargo Logistics',
    showLogoOnLR: true,
    logoStyle: 'emblem',
    backupOnExit: true
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased select-none">
      {/* Top Mobile Bar */}
      <header className="lg:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 no-print">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <TransportLogo settings={safeSettings} size="sm" />
          <div>
            <span className="font-extrabold text-xs block leading-tight tracking-wide text-white">
              {safeSettings.companyName || 'SRI MURUGAN TRANSPORT'}
            </span>
            <span className="text-[10px] text-blue-400 font-medium">Offline TMS</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInstallModal(true)}
            className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
            title="Install PC App"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={handleTriggerCloseApp}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-400"
            title="Backup Data & Exit"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop & Drawer) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col
            border-r border-slate-800 transition-transform duration-200 ease-in-out no-print
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo / Company Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <TransportLogo settings={safeSettings} size="md" />
              <div className="truncate">
                <h1 className="font-black text-sm text-white tracking-wide truncate">
                  {safeSettings.companyName || 'SRI MURUGAN TRANSPORT'}
                </h1>
                <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">
                  100% Offline PC Software
                </p>
              </div>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="p-3 border-b border-slate-800/60 space-y-2">
            <button
              onClick={() => handleNavigate('create-lr')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New LR (F2)</span>
            </button>

            <button
              onClick={() => setShowInstallModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-blue-300 rounded-lg text-xs font-bold border border-slate-800 transition-all cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Download / Install PC App</span>
            </button>
          </div>

          {/* Navigation Links Scroll Area */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
            {menuSections.map(sec => (
              <div key={sec.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                        w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all text-left cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : item.highlight
                          ? 'text-blue-300 hover:bg-slate-900 hover:text-white'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
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

          {/* Local Disk Status & Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={handleTriggerCloseApp}
                className="flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
                title="Backup database to local disk before exiting"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Backup Local Disk</span>
              </button>

              <button
                onClick={handleTriggerLogout}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
              <span className="flex items-center gap-1.5 text-slate-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span>Local Disk Database (100% Offline)</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Install PC App */}
              <button
                onClick={() => setShowInstallModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Download PC Offline App (.ZIP) or install on desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PC App</span>
              </button>

              {/* Local Disk Backup Prompt */}
              <button
                onClick={handleTriggerCloseApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-all cursor-pointer"
                title="Ask to backup database to local drive"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>Backup Local Disk</span>
              </button>

              {/* Create LR Quick Button */}
              <button
                onClick={() => handleNavigate('create-lr')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Create LR</span>
              </button>

              {/* User Profile & Sign Out */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div 
                  onClick={() => handleNavigate('user-management')}
                  className="text-right text-xs cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="font-bold text-slate-800 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleTriggerLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out & Backup"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Content Views */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {currentView === 'dashboard' && (
              <DashboardView 
                settings={safeSettings}
                currentUser={currentUser.name}
                onNavigate={(v) => handleNavigate(v as NavigationMenuKey)}
                onEditLR={handleEditLR}
              />
            )}

            {currentView === 'create-lr' && (
              <CreateLRView
                initialLR={editingLR}
                settings={safeSettings}
                currentUser={currentUser.name}
                onSaved={handleLRSaved}
                onCancel={() => handleNavigate('lr-database')}
              />
            )}

            {currentView === 'lr-database' && (
              <LRDatabaseView
                settings={safeSettings}
                currentUser={currentUser.name}
                onEditLR={handleEditLR}
                onCreateNewLR={() => handleNavigate('create-lr')}
              />
            )}

            {currentView === 'print-reprint' && (
              <LRPrintReprintView settings={safeSettings} />
            )}

            {currentView === 'party-master' && (
              <PartyMasterView
                settings={safeSettings}
                initialType="Customer"
                onViewLedger={handleViewLedger}
              />
            )}

            {currentView === 'consignor-consignee' && (
              <PartyMasterView
                settings={safeSettings}
                initialType="Both"
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
                settings={safeSettings}
                currentUser={currentUser.name}
              />
            )}

            {currentView === 'customer-ledger' && (
              <CustomerLedgerView
                settings={safeSettings}
                preselectedParty={selectedLedgerParty}
              />
            )}

            {currentView === 'topay-outstanding' && (
              <OutstandingReportsView
                settings={safeSettings}
                currentUser={currentUser.name}
                initialType="topay"
              />
            )}

            {currentView === 'paid-report' && (
              <OutstandingReportsView
                settings={safeSettings}
                currentUser={currentUser.name}
                initialType="paid"
              />
            )}

            {currentView === 'collection-report' && (
              <OutstandingReportsView
                settings={safeSettings}
                currentUser={currentUser.name}
                initialType="collection"
              />
            )}

            {currentView === 'daily-report' && (
              <OperationalReportsView
                settings={safeSettings}
                defaultMode="daily"
              />
            )}

            {currentView === 'monthly-report' && (
              <OperationalReportsView
                settings={safeSettings}
                defaultMode="monthly"
              />
            )}

            {currentView === 'expense-management' && (
              <ExpenseManagementView />
            )}

            {currentView === 'operational-reports' && (
              <OperationalReportsView
                settings={safeSettings}
                defaultMode="route"
              />
            )}

            {currentView === 'company-settings' && (
              <CompanySettingsView
                settings={safeSettings}
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
          settings={safeSettings}
          onClose={() => {
            setJustCreatedLR(null);
            setCurrentView('lr-database');
          }}
        />
      )}

      {/* Offline Backup on Exit / Close Modal */}
      {showBackupPrompt && (
        <OfflineBackupPromptModal
          isLogoutAction={isLogoutAction}
          onClose={() => setShowBackupPrompt(false)}
          onConfirmExit={handleConfirmExitOrLogout}
        />
      )}

      {/* PC App Install & Standalone Launcher Modal */}
      {showInstallModal && (
        <DesktopInstallModal
          onClose={() => setShowInstallModal(false)}
        />
      )}
    </div>
  );
}
