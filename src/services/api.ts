/**
 * UNIVERS AUTO CRM - Service d'accès API Backend & MySQL
 * Fait le lien direct avec le serveur Node/Express et la base MySQL.
 */

export const api = {
  // System & Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getDatabaseStatus() {
    const res = await fetch('/api/database/status');
    return res.json();
  },

  async testDatabaseConnection(config: { host: string; port: number; user: string; password?: string; database: string }) {
    const res = await fetch('/api/database/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async connectDatabase(config: { host: string; port: number; user: string; password?: string; database: string }) {
    const res = await fetch('/api/database/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async runDatabaseMigration() {
    const res = await fetch('/api/database/migrate', { method: 'POST' });
    return res.json();
  },

  async exportFullBackup() {
    const res = await fetch('/api/backup/export');
    return res.json();
  },

  async importFullBackup(data: any) {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Auth & Setup
  async getSetupStatus() {
    const res = await fetch('/api/auth/setup-status');
    return res.json();
  },

  async registerAdmin(data: { username: string; password: string; fullName: string; phone?: string; email?: string }) {
    const res = await fetch('/api/auth/register-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(credentials: { username: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Users & Employees
  async getUsers() {
    const res = await fetch('/api/auth/users');
    return res.json();
  },

  async createUser(data: any) {
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la création de l\'utilisateur');
    }
    return res.json();
  },

  async updateUser(id: string, data: any) {
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
    return res.json();
  },

  // Vehicles
  async getVehicles() {
    const res = await fetch('/api/vehicles');
    return res.json();
  },

  async createVehicle(data: any) {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la création du véhicule');
    }
    return res.json();
  },

  async updateVehicle(id: string, data: any) {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la mise à jour du véhicule');
    }
    return res.json();
  },

  async deleteVehicle(id: string) {
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la suppression du véhicule');
    }
    return res.json();
  },

  // Purchases (Achats & Approvisionnements)
  async getPurchases() {
    const res = await fetch('/api/purchases');
    return res.json();
  },

  async createPurchase(data: any) {
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de l\'enregistrement de l\'achat');
    }
    return res.json();
  },

  async updatePurchase(id: string, data: any) {
    const res = await fetch(`/api/purchases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePurchase(id: string) {
    const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Sales (Ventes)
  async getSales() {
    const res = await fetch('/api/sales');
    return res.json();
  },

  async createSale(data: any) {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la vente');
    }
    return res.json();
  },

  async updateSale(id: string, data: any) {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSale(id: string) {
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Reservations
  async getReservations() {
    const res = await fetch('/api/reservations');
    return res.json();
  },

  async createReservation(data: any) {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la réservation');
    }
    return res.json();
  },

  async updateReservation(id: string, data: any) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Clients
  async getClients() {
    const res = await fetch('/api/clients');
    return res.json();
  },

  async getClientDetail(id: string) {
    const res = await fetch(`/api/clients/${id}`);
    return res.json();
  },

  async createClient(data: any) {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la création du client');
    }
    return res.json();
  },

  async updateClient(id: string, data: any) {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteClient(id: string) {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la suppression du client');
    }
    return res.json();
  },

  // Invoices & Quotes
  async getInvoices() {
    const res = await fetch('/api/invoices');
    return res.json();
  },

  async createInvoice(data: any) {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Payments (Encaissements)
  async getPayments() {
    const res = await fetch('/api/payments');
    return res.json();
  },

  async createPayment(data: any) {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Expenses (Dépenses)
  async getExpenses() {
    const res = await fetch('/api/expenses');
    return res.json();
  },

  async createExpense(data: any) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Metrics & Reports
  async getDashboardMetrics() {
    const res = await fetch('/api/reports/metrics');
    return res.json();
  },

  async getActivityLogs() {
    const res = await fetch('/api/activity-logs');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
