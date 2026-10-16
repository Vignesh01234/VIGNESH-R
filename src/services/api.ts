import type { 
  CompanySettings, LR, Party, Vehicle, Driver, 
  City, Route, Payment, Expense, User, AuditLog, LRStatus 
} from '../types/index';

// Current active user stored in localStorage for role switcher
const USER_KEY = 'smt_active_user';

export function getActiveUser(): User {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    id: 'usr-1',
    username: 'admin',
    name: 'M. Selvaraj (Admin)',
    role: 'Administrator',
    phone: '9444012345',
    email: 'admin@srimurugantransport.com',
    active: true
  };
}

export function setActiveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getHeaders(): HeadersInit {
  const user = getActiveUser();
  return {
    'Content-Type': 'application/json',
    'x-user-name': user.name || 'Admin',
    'x-user-role': user.role || 'Administrator'
  };
}

export const api = {
  // Settings
  async getSettings(): Promise<CompanySettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // LR
  async getNextLRNumber(): Promise<string> {
    const res = await fetch('/api/lr/next-number');
    if (!res.ok) throw new Error('Failed to fetch next LR number');
    const data = await res.json();
    return data.nextLrNumber;
  },

  async getLRs(params?: {
    search?: string;
    status?: string;
    paymentType?: string;
    fromCity?: string;
    toCity?: string;
    startDate?: string;
    endDate?: string;
    party?: string;
  }): Promise<LR[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'All') query.set(k, v);
      });
    }
    const res = await fetch(`/api/lr?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch LRs');
    return res.json();
  },

  async getLR(id: string): Promise<LR> {
    const res = await fetch(`/api/lr/${id}`);
    if (!res.ok) throw new Error('LR not found');
    return res.json();
  },

  async saveLR(lr: Partial<LR>): Promise<LR> {
    const res = await fetch('/api/lr', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lr)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save LR');
    }
    return res.json();
  },

  async updateLRStatus(id: string, status: LRStatus, details?: { deliveryDate?: string; receivedBy?: string; podReference?: string; remarks?: string }): Promise<LR> {
    const res = await fetch(`/api/lr/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, details })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async cancelLR(id: string, reason: string): Promise<LR> {
    const res = await fetch(`/api/lr/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel LR');
    }
    return res.json();
  },

  // Parties
  async getParties(): Promise<Party[]> {
    const res = await fetch('/api/parties');
    if (!res.ok) throw new Error('Failed to fetch parties');
    return res.json();
  },

  async saveParty(party: Partial<Party>): Promise<Party> {
    const res = await fetch('/api/parties', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(party)
    });
    if (!res.ok) throw new Error('Failed to save party');
    return res.json();
  },

  async deleteParty(id: string): Promise<void> {
    const res = await fetch(`/api/parties/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete party');
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles');
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  },

  async saveVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) throw new Error('Failed to save vehicle');
    return res.json();
  },

  async deleteVehicle(id: string): Promise<void> {
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete vehicle');
  },

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    const res = await fetch('/api/drivers');
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return res.json();
  },

  async saveDriver(driver: Partial<Driver>): Promise<Driver> {
    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(driver)
    });
    if (!res.ok) throw new Error('Failed to save driver');
    return res.json();
  },

  async deleteDriver(id: string): Promise<void> {
    const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete driver');
  },

  // Cities & Routes
  async getCities(): Promise<City[]> {
    const res = await fetch('/api/cities');
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  async saveCity(city: Partial<City>): Promise<City> {
    const res = await fetch('/api/cities', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(city)
    });
    if (!res.ok) throw new Error('Failed to save city');
    return res.json();
  },

  async getRoutes(): Promise<Route[]> {
    const res = await fetch('/api/routes');
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },

  async saveRoute(route: Partial<Route>): Promise<Route> {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(route)
    });
    if (!res.ok) throw new Error('Failed to save route');
    return res.json();
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch('/api/payments');
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async recordPayment(pay: Partial<Payment>): Promise<Payment> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pay)
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  async deletePayment(id: string): Promise<void> {
    const res = await fetch(`/api/payments/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete payment');
  },

  // Customer Ledger
  async getPartyLedger(partyIdOrName: string, startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    const res = await fetch(`/api/ledger/${encodeURIComponent(partyIdOrName)}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch party ledger');
    return res.json();
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch('/api/expenses');
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async saveExpense(expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Failed to save expense');
    return res.json();
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to delete expense');
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async saveUser(user: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to save user');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Reset demo
  async resetDemo(): Promise<void> {
    const res = await fetch('/api/reset-demo', { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to reset demo');
  },

  // Backup
  async restoreBackup(json: any): Promise<void> {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(json)
    });
    if (!res.ok) throw new Error('Failed to restore backup');
  }
};
