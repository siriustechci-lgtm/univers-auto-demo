import fs from 'fs';
import path from 'path';
import mysql, { Pool } from 'mysql2/promise';
import crypto from 'crypto';
import { UNIVERS_AUTO_MYSQL_SCHEMA } from './sqlSchema';

export interface MySqlConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  slogan: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  rccm: string;
  ninea: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxEnabled: boolean;
  invoicePrefix: string;
  quotePrefix: string;
  receiptPrefix: string;
  purchasePrefix: string;
  reservationPrefix: string;
  vehiclePrefix: string;
  legalTerms?: string;
  invoiceFooter?: string;
  mysqlConfig?: MySqlConfig;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'univers_auto_db.json');
const CONFIG_FILE = path.join(DATA_DIR, 'db_config.json');

// Memory cache + Disk storage fallback when MySQL is not connected
interface StorageSchema {
  settings: CompanySettings;
  users: any[];
  vehicles: any[];
  purchases: any[];
  sales: any[];
  reservations: any[];
  clients: any[];
  invoices: any[];
  payments: any[];
  expenses: any[];
  activityLogs: any[];
}

const defaultSettings: CompanySettings = {
  id: 'settings_1',
  companyName: 'UNIVERS AUTO',
  slogan: 'Achat & Vente de Véhicules Neufs et d’Occasion',
  logoUrl: '',
  phone: '+221 33 800 00 00',
  whatsapp: '+221 77 000 00 00',
  email: 'contact@universauto.sn',
  address: 'Boulevard du Centenaire de la Commune de Dakar',
  city: 'Dakar',
  country: 'Sénégal',
  rccm: 'SN.DKR.2024.B.1234',
  ninea: '0098765432Y',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  taxRate: 18,
  taxEnabled: false,
  invoicePrefix: 'FAC',
  quotePrefix: 'DEV',
  receiptPrefix: 'REC',
  purchasePrefix: 'ACH',
  reservationPrefix: 'RES',
  vehiclePrefix: 'UA',
  legalTerms: 'Véhicules vendus avec garantie légale et contrôle technique certifié. Aucun véhicule ne quitte le parc sans règlement complet ou accord de financement validé.',
  invoiceFooter: 'UNIVERS AUTO — Votre partenaire de confiance pour l’automobile neuve et d’occasion certifiée.',
};

class DatabaseManager {
  private pool: Pool | null = null;
  private isMySqlConnected = false;
  private mySqlError: string | null = null;
  private inMemoryDb: StorageSchema = {
    settings: { ...defaultSettings },
    users: [],
    vehicles: [],
    purchases: [],
    sales: [],
    reservations: [],
    clients: [],
    invoices: [],
    payments: [],
    expenses: [],
    activityLogs: [],
  };

  constructor() {
    this.ensureDataDir();
    this.loadLocalDb();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadLocalDb() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.inMemoryDb = {
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
          users: parsed.users || [],
          vehicles: parsed.vehicles || [],
          purchases: parsed.purchases || [],
          sales: parsed.sales || [],
          reservations: parsed.reservations || [],
          clients: parsed.clients || [],
          invoices: parsed.invoices || [],
          payments: parsed.payments || [],
          expenses: parsed.expenses || [],
          activityLogs: parsed.activityLogs || [],
        };
      } else {
        this.saveLocalDb();
      }
    } catch (e) {
      console.error('Error reading local db file, initializing empty database:', e);
      this.saveLocalDb();
    }
  }

  private saveLocalDb() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.inMemoryDb, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local db file:', e);
    }
  }

  public async init() {
    // Check environment variables first
    const envHost = process.env.MYSQL_HOST;
    const envUser = process.env.MYSQL_USER;
    const envPassword = process.env.MYSQL_PASSWORD;
    const envDatabase = process.env.MYSQL_DATABASE;
    const envPort = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

    let targetConfig: MySqlConfig | null = null;

    if (envHost && envUser && envDatabase) {
      targetConfig = {
        host: envHost,
        port: envPort,
        user: envUser,
        password: envPassword || '',
        database: envDatabase,
      };
    } else if (fs.existsSync(CONFIG_FILE)) {
      try {
        const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
        targetConfig = JSON.parse(fileContent);
      } catch (err) {
        console.warn('Could not read config file:', err);
      }
    }

    if (targetConfig) {
      await this.connectMySql(targetConfig);
    } else {
      console.log('ℹ️ MySQL not configured yet. Server using local high-performance persistent store.');
    }
  }

  public async connectMySql(config: MySqlConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }

      const pool = mysql.createPool({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password || '',
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // Test connection
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      this.pool = pool;
      this.isMySqlConnected = true;
      this.mySqlError = null;

      // Save valid config to file
      this.ensureDataDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');

      // Run automatic migration to ensure tables exist
      await this.runMigrations();

      console.log(`✅ Connected successfully to MySQL database "${config.database}" on ${config.host}:${config.port}`);
      return { success: true, message: `Connexion réussie à la base de données MySQL : ${config.database}` };
    } catch (err: any) {
      console.warn(`⚠️ MySQL connection error to ${config.host}: ${err.message}`);
      this.isMySqlConnected = false;
      this.mySqlError = err.message;
      return { success: false, message: `Échec de connexion MySQL : ${err.message}` };
    }
  }

  public async testConnection(config: MySqlConfig): Promise<{ success: boolean; message: string }> {
    try {
      const conn = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password || '',
        database: config.database,
        connectTimeout: 8000,
      });
      await conn.ping();
      await conn.end();
      return { success: true, message: 'Test de connexion MySQL réussi !' };
    } catch (err: any) {
      return { success: false, message: `Erreur MySQL : ${err.message}` };
    }
  }

  public async runMigrations(): Promise<{ success: boolean; message: string }> {
    if (!this.pool) {
      return { success: false, message: 'MySQL non connecté' };
    }

    try {
      // Split schema into statements
      const statements = UNIVERS_AUTO_MYSQL_SCHEMA
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      const connection = await this.pool.getConnection();
      try {
        for (const statement of statements) {
          if (statement) {
            await connection.query(statement);
          }
        }
      } finally {
        connection.release();
      }

      return { success: true, message: 'Schéma MySQL initialisé et mis à jour avec succès.' };
    } catch (err: any) {
      console.error('Migration error:', err);
      return { success: false, message: `Erreur de migration : ${err.message}` };
    }
  }

  public getStatus() {
    return {
      connected: this.isMySqlConnected,
      driver: this.isMySqlConnected ? 'MySQL (Hostinger / Remote)' : 'Serveur Node.js (Fichier local persistant)',
      error: this.mySqlError,
      records: {
        vehicles: this.inMemoryDb.vehicles.length,
        purchases: this.inMemoryDb.purchases.length,
        sales: this.inMemoryDb.sales.length,
        reservations: this.inMemoryDb.reservations.length,
        clients: this.inMemoryDb.clients.length,
        invoices: this.inMemoryDb.invoices.length,
        payments: this.inMemoryDb.payments.length,
        expenses: this.inMemoryDb.expenses.length,
        users: this.inMemoryDb.users.length,
      }
    };
  }

  // ==========================================
  // SETTINGS & COMPANY
  // ==========================================
  public getSettings(): CompanySettings {
    return { ...this.inMemoryDb.settings };
  }

  public updateSettings(partial: Partial<CompanySettings>): CompanySettings {
    this.inMemoryDb.settings = { ...this.inMemoryDb.settings, ...partial };
    this.saveLocalDb();
    return this.inMemoryDb.settings;
  }

  // ==========================================
  // USERS & AUTH
  // ==========================================
  public getUsers() {
    return this.inMemoryDb.users.map(u => {
      const { password_hash, password, ...rest } = u;
      return rest;
    });
  }

  public getUserByUsername(username: string) {
    return this.inMemoryDb.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
  }

  public getUserById(id: string) {
    const user = this.inMemoryDb.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, password, ...rest } = user;
    return rest;
  }

  public createUser(userData: any) {
    const existing = this.getUserByUsername(userData.username);
    if (existing) {
      throw new Error(`Le nom d'utilisateur "${userData.username}" est déjà utilisé.`);
    }

    const newUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      username: userData.username.trim(),
      password_hash: userData.password ? crypto.createHash('sha256').update(userData.password).digest('hex') : '',
      fullName: userData.fullName || userData.full_name || '',
      role: userData.role || 'Commercial',
      phone: userData.phone || '',
      email: userData.email || '',
      commissionRate: Number(userData.commissionRate || 0),
      monthlyTarget: Number(userData.monthlyTarget || 0),
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      permissions: userData.permissions || ['dashboard', 'vehicles', 'sales', 'clients'],
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.users.push(newUser);
    this.saveLocalDb();

    this.logActivity({
      userId: newUser.id,
      userName: newUser.fullName,
      userRole: newUser.role,
      actionType: 'Création',
      module: 'Employés',
      description: `Création du compte employé/utilisateur ${newUser.fullName} (${newUser.role})`,
    });

    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  }

  public verifyPassword(user: any, candidatePassword: string): boolean {
    if (!user.password_hash) return false;
    const hash = crypto.createHash('sha256').update(candidatePassword).digest('hex');
    return user.password_hash === hash;
  }

  public updateUser(id: string, partial: any) {
    const index = this.inMemoryDb.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Utilisateur introuvable');

    const current = this.inMemoryDb.users[index];
    if (partial.password) {
      partial.password_hash = crypto.createHash('sha256').update(partial.password).digest('hex');
      delete partial.password;
    }

    this.inMemoryDb.users[index] = { ...current, ...partial, updatedAt: new Date().toISOString() };
    this.saveLocalDb();

    const { password_hash, ...safe } = this.inMemoryDb.users[index];
    return safe;
  }

  public deleteUser(id: string) {
    const user = this.inMemoryDb.users.find(u => u.id === id);
    if (!user) throw new Error('Utilisateur non trouvé');
    if (user.role === 'Administrateur' && this.inMemoryDb.users.filter(u => u.role === 'Administrateur').length <= 1) {
      throw new Error('Impossible de supprimer le dernier compte Administrateur.');
    }

    this.inMemoryDb.users = this.inMemoryDb.users.filter(u => u.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // VEHICULES (PARC AUTOMOBILE)
  // ==========================================
  public getVehicles() {
    return [...this.inMemoryDb.vehicles];
  }

  public getVehicleById(id: string) {
    return this.inMemoryDb.vehicles.find(v => v.id === id) || null;
  }

  public createVehicle(data: any) {
    // Generate unique reference if not provided
    const prefix = this.inMemoryDb.settings.vehiclePrefix || 'UA';
    const count = this.inMemoryDb.vehicles.length + 1;
    const reference = data.reference?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    // Calculate total cost and margin
    const purchasePrice = Number(data.purchasePrice || 0);
    const transitFee = Number(data.transitFee || 0);
    const customsFee = Number(data.customsFee || 0);
    const transportFee = Number(data.transportFee || 0);
    const repairFee = Number(data.repairFee || 0);
    const otherFees = Number(data.otherFees || 0);

    const totalCost = purchasePrice + transitFee + customsFee + transportFee + repairFee + otherFees;
    const sellingPrice = Number(data.sellingPrice || 0);
    const profitMargin = sellingPrice - totalCost;
    const marginRate = totalCost > 0 ? (profitMargin / totalCost) * 100 : 0;

    const newVehicle = {
      id: `veh_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      reference,
      make: data.make?.trim() || 'Véhicule',
      model: data.model?.trim() || '',
      version: data.version?.trim() || '',
      year: Number(data.year) || new Date().getFullYear(),
      mileage: Number(data.mileage) || 0,
      fuelType: data.fuelType || 'Essence',
      transmission: data.transmission || 'Automatique',
      color: data.color?.trim() || '',
      vin: (data.vin || '').toUpperCase().trim(),
      registration: (data.registration || '').toUpperCase().trim(),
      condition: data.condition || 'Occasion', // 'Neuf' | 'Occasion'
      supplier: data.supplier?.trim() || '',
      acquisitionDate: data.acquisitionDate || new Date().toISOString().split('T')[0],
      purchasePrice,
      transitFee,
      customsFee,
      transportFee,
      repairFee,
      otherFees,
      totalCost,
      sellingPrice,
      profitMargin,
      marginRate: Number(marginRate.toFixed(2)),
      status: data.status || 'Disponible', // 'Disponible' | 'Réservé' | 'Vendu' | 'En préparation'
      photos: Array.isArray(data.photos) ? data.photos : (data.photoUrl ? [data.photoUrl] : []),
      photoUrl: Array.isArray(data.photos) && data.photos.length > 0 ? data.photos[0] : (data.photoUrl || ''),
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryDb.vehicles.unshift(newVehicle);
    this.saveLocalDb();

    this.logActivity({
      userId: 'system',
      userName: 'Opérateur',
      userRole: 'Administrateur',
      actionType: 'Création',
      module: 'Véhicules',
      description: `Ajout au parc : ${newVehicle.make} ${newVehicle.model} (${newVehicle.reference})`,
    });

    return newVehicle;
  }

  public updateVehicle(id: string, data: any) {
    const index = this.inMemoryDb.vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Véhicule introuvable');

    const current = this.inMemoryDb.vehicles[index];

    const purchasePrice = data.purchasePrice !== undefined ? Number(data.purchasePrice) : current.purchasePrice;
    const transitFee = data.transitFee !== undefined ? Number(data.transitFee) : current.transitFee;
    const customsFee = data.customsFee !== undefined ? Number(data.customsFee) : current.customsFee;
    const transportFee = data.transportFee !== undefined ? Number(data.transportFee) : current.transportFee;
    const repairFee = data.repairFee !== undefined ? Number(data.repairFee) : current.repairFee;
    const otherFees = data.otherFees !== undefined ? Number(data.otherFees) : current.otherFees;

    const totalCost = purchasePrice + transitFee + customsFee + transportFee + repairFee + otherFees;
    const sellingPrice = data.sellingPrice !== undefined ? Number(data.sellingPrice) : current.sellingPrice;
    const profitMargin = sellingPrice - totalCost;
    const marginRate = totalCost > 0 ? (profitMargin / totalCost) * 100 : 0;

    const updated = {
      ...current,
      ...data,
      purchasePrice,
      transitFee,
      customsFee,
      transportFee,
      repairFee,
      otherFees,
      totalCost,
      sellingPrice,
      profitMargin,
      marginRate: Number(marginRate.toFixed(2)),
      updatedAt: new Date().toISOString(),
    };

    if (data.photos) {
      updated.photos = data.photos;
      updated.photoUrl = data.photos[0] || '';
    }

    this.inMemoryDb.vehicles[index] = updated;
    this.saveLocalDb();
    return updated;
  }

  public deleteVehicle(id: string) {
    const vehicle = this.inMemoryDb.vehicles.find(v => v.id === id);
    if (!vehicle) throw new Error('Véhicule non trouvé');
    if (vehicle.status === 'Vendu') {
      throw new Error('Impossible de supprimer un véhicule déjà vendu. Il doit rester dans l’historique des ventes.');
    }

    this.inMemoryDb.vehicles = this.inMemoryDb.vehicles.filter(v => v.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // ACHATS & APPROVISIONNEMENTS
  // ==========================================
  public getPurchases() {
    return [...this.inMemoryDb.purchases];
  }

  public createPurchase(data: any) {
    const prefix = this.inMemoryDb.settings.purchasePrefix || 'ACH';
    const count = this.inMemoryDb.purchases.length + 1;
    const purchaseNumber = data.purchaseNumber?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const purchasePrice = Number(data.purchasePrice || 0);
    const customsFee = Number(data.customsFee || 0);
    const shippingFee = Number(data.shippingFee || 0);
    const transportFee = Number(data.transportFee || 0);
    const preparationFee = Number(data.preparationFee || 0);
    const otherCharges = Number(data.otherCharges || 0);
    const totalCost = purchasePrice + customsFee + shippingFee + transportFee + preparationFee + otherCharges;
    const amountPaid = Number(data.amountPaid !== undefined ? data.amountPaid : totalCost);

    const newPurchase = {
      id: `pch_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      purchaseNumber,
      date: data.date || new Date().toISOString().split('T')[0],
      vehicleId: data.vehicleId || null,
      vehicleInfo: data.vehicleInfo || '',
      supplierName: data.supplierName?.trim() || 'Fournisseur',
      invoiceNumber: data.invoiceNumber?.trim() || '',
      purchasePrice,
      customsFee,
      shippingFee,
      transportFee,
      preparationFee,
      otherCharges,
      totalCost,
      status: data.status || 'Arrivé / En parc', // 'Commandé' | 'En transit' | 'En douane' | 'Arrivé / En parc' | 'Clôturé'
      paymentStatus: data.paymentStatus || (amountPaid >= totalCost ? 'Payé' : 'Partiellement payé'),
      amountPaid,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.purchases.unshift(newPurchase);

    // If an associated vehicle exists, update its cost breakdown automatically
    if (newPurchase.vehicleId) {
      const v = this.inMemoryDb.vehicles.find(veh => veh.id === newPurchase.vehicleId);
      if (v) {
        this.updateVehicle(v.id, {
          purchasePrice,
          transitFee: shippingFee,
          customsFee,
          transportFee,
          repairFee: preparationFee,
          otherFees: otherCharges,
        });
      }
    }

    this.saveLocalDb();
    return newPurchase;
  }

  public updatePurchase(id: string, data: any) {
    const idx = this.inMemoryDb.purchases.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Achat non trouvé');

    this.inMemoryDb.purchases[idx] = { ...this.inMemoryDb.purchases[idx], ...data };
    this.saveLocalDb();
    return this.inMemoryDb.purchases[idx];
  }

  public deletePurchase(id: string) {
    this.inMemoryDb.purchases = this.inMemoryDb.purchases.filter(p => p.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // CLIENTS
  // ==========================================
  public getClients() {
    return [...this.inMemoryDb.clients];
  }

  public getClientById(id: string) {
    const client = this.inMemoryDb.clients.find(c => c.id === id);
    if (!client) return null;

    // Attach 360 overview
    const sales = this.inMemoryDb.sales.filter(s => s.clientId === id);
    const reservations = this.inMemoryDb.reservations.filter(r => r.clientId === id);
    const payments = this.inMemoryDb.payments.filter(p => p.clientId === id);
    const totalPurchased = sales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalDebt = sales.reduce((sum, s) => sum + (s.balanceDue || 0), 0);

    return {
      ...client,
      sales,
      reservations,
      payments,
      stats: {
        totalPurchased,
        totalPaid,
        totalDebt,
        salesCount: sales.length,
        reservationsCount: reservations.length,
      }
    };
  }

  public createClient(data: any) {
    const count = this.inMemoryDb.clients.length + 1;
    const clientNumber = data.clientNumber?.trim() || `CLI-${String(count).padStart(4, '0')}`;

    const newClient = {
      id: `cli_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      clientNumber,
      type: data.type || 'Particulier', // 'Particulier' | 'Entreprise'
      firstName: data.firstName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      companyName: data.companyName?.trim() || '',
      fullName: data.type === 'Entreprise' ? (data.companyName || '') : `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      phone: data.phone?.trim() || '',
      whatsapp: data.whatsapp?.trim() || '',
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      idType: data.idType || 'CNI',
      idNumber: data.idNumber?.trim() || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryDb.clients.unshift(newClient);
    this.saveLocalDb();
    return newClient;
  }

  public updateClient(id: string, data: any) {
    const idx = this.inMemoryDb.clients.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Client introuvable');

    const current = this.inMemoryDb.clients[idx];
    const updated = {
      ...current,
      ...data,
      fullName: (data.type || current.type) === 'Entreprise' 
        ? (data.companyName || current.companyName) 
        : `${data.firstName !== undefined ? data.firstName : current.firstName} ${data.lastName !== undefined ? data.lastName : current.lastName}`.trim(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryDb.clients[idx] = updated;
    this.saveLocalDb();
    return updated;
  }

  public deleteClient(id: string) {
    const hasSales = this.inMemoryDb.sales.some(s => s.clientId === id);
    if (hasSales) {
      throw new Error('Impossible de supprimer un client ayant déjà des ventes enregistrées.');
    }
    this.inMemoryDb.clients = this.inMemoryDb.clients.filter(c => c.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // VENTES (SALES)
  // ==========================================
  public getSales() {
    return [...this.inMemoryDb.sales];
  }

  public createSale(data: any) {
    // 1. Rigorous check: Prevent simultaneous double selling of the same vehicle
    const vehicle = this.inMemoryDb.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) {
      throw new Error('Le véhicule sélectionné est introuvable.');
    }

    if (vehicle.status === 'Vendu') {
      throw new Error(`Ce véhicule (${vehicle.make} ${vehicle.model} - ${vehicle.reference}) est DÉJÀ VENDU. La vente simultanée est strictement interdite.`);
    }

    if (vehicle.status === 'Réservé') {
      // Check if reserved by another client
      const activeRes = this.inMemoryDb.reservations.find(r => r.vehicleId === vehicle.id && r.status === 'En cours');
      if (activeRes && activeRes.clientId !== data.clientId) {
        throw new Error(`Ce véhicule est actuellement RÉSERVÉ par un autre client (${activeRes.clientName}). Libérez la réservation avant de vendre à un autre client.`);
      }
    }

    // 2. Financial calculation
    const agreedPrice = Number(data.agreedPrice || vehicle.sellingPrice || 0);
    const discount = Number(data.discount || 0);
    const finalPrice = Math.max(0, agreedPrice - discount);
    const deposit = Number(data.deposit || 0);
    const balanceDue = Math.max(0, finalPrice - deposit);

    const paymentStatus = balanceDue === 0 ? 'Payé intégralement' : (deposit > 0 ? 'Acompte versé / Solde dû' : 'En attente');

    // Commission calculation
    const commissionRate = Number(data.commissionRate || 0);
    const commissionAmount = Number(data.commissionAmount !== undefined ? data.commissionAmount : (finalPrice * commissionRate) / 100);

    const prefix = 'VTE';
    const count = this.inMemoryDb.sales.length + 1;
    const saleNumber = data.saleNumber?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newSale = {
      id: `sle_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      saleNumber,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model} ${vehicle.version || ''} (${vehicle.year})`.trim(),
      vehicleVin: vehicle.vin || '',
      vehicleRegistration: vehicle.registration || '',
      clientId: data.clientId,
      clientName: data.clientName?.trim() || 'Client',
      clientPhone: data.clientPhone?.trim() || '',
      sellerId: data.sellerId || '',
      sellerName: data.sellerName?.trim() || '',
      saleDate: data.saleDate || new Date().toISOString().split('T')[0],
      agreedPrice,
      discount,
      finalPrice,
      deposit,
      balanceDue,
      paymentMethod: data.paymentMethod || 'Espèces',
      paymentStatus,
      commissionRate,
      commissionAmount,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.sales.unshift(newSale);

    // 3. Mark vehicle as Vendu immediately!
    this.updateVehicle(vehicle.id, {
      status: 'Vendu',
      sellingPrice: finalPrice,
    });

    // 4. If reservation existed, mark it as 'Convertie en vente'
    const relatedRes = this.inMemoryDb.reservations.find(r => r.vehicleId === vehicle.id && r.status === 'En cours');
    if (relatedRes) {
      relatedRes.status = 'Confirmée / Convertie en vente';
    }

    // 5. Automatically create official Invoice (Facture)
    const invoicePrefix = this.inMemoryDb.settings.invoicePrefix || 'FAC';
    const invoiceCount = this.inMemoryDb.invoices.length + 1;
    const invoiceNumber = `${invoicePrefix}-${new Date().getFullYear()}-${String(invoiceCount).padStart(4, '0')}`;

    const newInvoice = {
      id: `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      invoiceNumber,
      type: 'Facture',
      referenceId: newSale.id,
      date: newSale.saleDate,
      dueDate: balanceDue > 0 ? (data.dueDate || newSale.saleDate) : newSale.saleDate,
      clientId: newSale.clientId,
      clientName: newSale.clientName,
      clientPhone: newSale.clientPhone,
      vehicleId: vehicle.id,
      vehicleName: newSale.vehicleName,
      subtotal: finalPrice,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: finalPrice,
      amountPaid: deposit,
      balanceDue,
      status: balanceDue === 0 ? 'Payée' : (deposit > 0 ? 'Partiellement payée' : 'En attente'),
      paymentMethod: newSale.paymentMethod,
      notes: newSale.notes,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryDb.invoices.unshift(newInvoice);

    // 6. If deposit was paid, create corresponding Payment entry
    if (deposit > 0) {
      const receiptPrefix = this.inMemoryDb.settings.receiptPrefix || 'REC';
      const paymentCount = this.inMemoryDb.payments.length + 1;
      const paymentNumber = `${receiptPrefix}-${new Date().getFullYear()}-${String(paymentCount).padStart(4, '0')}`;

      this.inMemoryDb.payments.unshift({
        id: `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        paymentNumber,
        referenceType: 'Vente',
        referenceId: newSale.id,
        referenceTitle: `Vente ${newSale.saleNumber} - ${newSale.vehicleName}`,
        clientId: newSale.clientId,
        clientName: newSale.clientName,
        clientPhone: newSale.clientPhone,
        amount: deposit,
        paymentDate: newSale.saleDate,
        paymentMethod: newSale.paymentMethod,
        status: 'Validé',
        notes: `Acompte initial de vente`,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveLocalDb();

    this.logActivity({
      userId: data.sellerId || 'system',
      userName: data.sellerName || 'Commercial',
      userRole: 'Commercial',
      actionType: 'Vente',
      module: 'Ventes',
      description: `Vente confirmée ${newSale.saleNumber} : ${newSale.vehicleName} à ${newSale.clientName} (${finalPrice.toLocaleString('fr-FR')} FCFA)`,
    });

    return newSale;
  }

  public updateSale(id: string, data: any) {
    const idx = this.inMemoryDb.sales.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Vente non trouvée');

    this.inMemoryDb.sales[idx] = { ...this.inMemoryDb.sales[idx], ...data };
    this.saveLocalDb();
    return this.inMemoryDb.sales[idx];
  }

  public deleteSale(id: string) {
    const sale = this.inMemoryDb.sales.find(s => s.id === id);
    if (!sale) throw new Error('Vente introuvable');

    // Free the vehicle back to 'Disponible'
    if (sale.vehicleId) {
      this.updateVehicle(sale.vehicleId, { status: 'Disponible' });
    }

    this.inMemoryDb.sales = this.inMemoryDb.sales.filter(s => s.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // RÉSERVATIONS
  // ==========================================
  public getReservations() {
    return [...this.inMemoryDb.reservations];
  }

  public createReservation(data: any) {
    const vehicle = this.inMemoryDb.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) throw new Error('Véhicule introuvable');

    if (vehicle.status === 'Vendu') {
      throw new Error('Ce véhicule est déjà vendu et ne peut plus être réservé.');
    }
    if (vehicle.status === 'Réservé') {
      throw new Error('Ce véhicule fait déjà l’objet d’une réservation active.');
    }

    const validityDays = Number(data.validityDays || 7);
    const reservationDate = data.reservationDate || new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date(reservationDate);
    expiryDateObj.setDate(expiryDateObj.getDate() + validityDays);
    const expiryDate = data.expiryDate || expiryDateObj.toISOString().split('T')[0];

    const prefix = this.inMemoryDb.settings.reservationPrefix || 'RES';
    const count = this.inMemoryDb.reservations.length + 1;
    const reservationNumber = data.reservationNumber?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const depositAmount = Number(data.depositAmount || 0);

    const newReservation = {
      id: `res_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      reservationNumber,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      clientId: data.clientId,
      clientName: data.clientName?.trim() || 'Client',
      clientPhone: data.clientPhone?.trim() || '',
      depositAmount,
      paymentMethod: data.paymentMethod || 'Espèces',
      reservationDate,
      expiryDate,
      validityDays,
      status: 'En cours', // 'En cours' | 'Confirmée / Convertie en vente' | 'Expirée' | 'Annulée'
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.reservations.unshift(newReservation);

    // Block vehicle status
    this.updateVehicle(vehicle.id, { status: 'Réservé' });

    // If reservation deposit was paid, log a payment receipt
    if (depositAmount > 0) {
      const receiptPrefix = this.inMemoryDb.settings.receiptPrefix || 'REC';
      const paymentCount = this.inMemoryDb.payments.length + 1;
      this.inMemoryDb.payments.unshift({
        id: `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        paymentNumber: `${receiptPrefix}-${new Date().getFullYear()}-${String(paymentCount).padStart(4, '0')}`,
        referenceType: 'Réservation',
        referenceId: newReservation.id,
        referenceTitle: `Acompte Réservation ${newReservation.reservationNumber} - ${newReservation.vehicleName}`,
        clientId: newReservation.clientId,
        clientName: newReservation.clientName,
        clientPhone: newReservation.clientPhone,
        amount: depositAmount,
        paymentDate: reservationDate,
        paymentMethod: newReservation.paymentMethod,
        status: 'Validé',
        notes: `Acompte de réservation de véhicule`,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveLocalDb();
    return newReservation;
  }

  public updateReservation(id: string, data: any) {
    const idx = this.inMemoryDb.reservations.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Réservation introuvable');

    const current = this.inMemoryDb.reservations[idx];
    const updated = { ...current, ...data };

    // If status changed to Annulée or Expirée, free the vehicle
    if ((data.status === 'Annulée' || data.status === 'Expirée') && current.status === 'En cours') {
      this.updateVehicle(current.vehicleId, { status: 'Disponible' });
    }

    this.inMemoryDb.reservations[idx] = updated;
    this.saveLocalDb();
    return updated;
  }

  // ==========================================
  // FACTURES & DEVIS
  // ==========================================
  public getInvoices() {
    return [...this.inMemoryDb.invoices];
  }

  public createInvoice(data: any) {
    const prefix = data.type === 'Devis' 
      ? (this.inMemoryDb.settings.quotePrefix || 'DEV') 
      : (this.inMemoryDb.settings.invoicePrefix || 'FAC');
    const count = this.inMemoryDb.invoices.length + 1;
    const invoiceNumber = data.invoiceNumber?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const subtotal = Number(data.subtotal || 0);
    const taxRate = Number(data.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const amountPaid = Number(data.amountPaid || 0);
    const balanceDue = Math.max(0, totalAmount - amountPaid);

    const newInvoice = {
      id: `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      invoiceNumber,
      type: data.type || 'Facture',
      referenceId: data.referenceId || '',
      date: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || '',
      clientId: data.clientId,
      clientName: data.clientName?.trim() || 'Client',
      clientPhone: data.clientPhone?.trim() || '',
      vehicleId: data.vehicleId || null,
      vehicleName: data.vehicleName || '',
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid,
      balanceDue,
      status: balanceDue === 0 ? 'Payée' : (amountPaid > 0 ? 'Partiellement payée' : 'En attente'),
      paymentMethod: data.paymentMethod || 'Espèces',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.invoices.unshift(newInvoice);
    this.saveLocalDb();
    return newInvoice;
  }

  // ==========================================
  // PAIEMENTS & ENCAISSEMENTS
  // ==========================================
  public getPayments() {
    return [...this.inMemoryDb.payments];
  }

  public createPayment(data: any) {
    const prefix = this.inMemoryDb.settings.receiptPrefix || 'REC';
    const count = this.inMemoryDb.payments.length + 1;
    const paymentNumber = data.paymentNumber?.trim() || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const amount = Number(data.amount || 0);

    const newPayment = {
      id: `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      paymentNumber,
      referenceType: data.referenceType || 'Vente',
      referenceId: data.referenceId || '',
      referenceTitle: data.referenceTitle || 'Règlement',
      clientId: data.clientId,
      clientName: data.clientName?.trim() || 'Client',
      clientPhone: data.clientPhone?.trim() || '',
      amount,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'Espèces',
      status: 'Validé',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.payments.unshift(newPayment);

    // If linked to a sale, update sale's amountPaid and balanceDue
    if (newPayment.referenceType === 'Vente' && newPayment.referenceId) {
      const sale = this.inMemoryDb.sales.find(s => s.id === newPayment.referenceId);
      if (sale) {
        sale.deposit = (sale.deposit || 0) + amount;
        sale.balanceDue = Math.max(0, sale.finalPrice - sale.deposit);
        sale.paymentStatus = sale.balanceDue === 0 ? 'Payé intégralement' : 'Acompte versé / Solde dû';
      }
    }

    // If linked to an invoice, update invoice
    if (newPayment.referenceId) {
      const invoice = this.inMemoryDb.invoices.find(inv => inv.id === newPayment.referenceId || inv.referenceId === newPayment.referenceId);
      if (invoice) {
        invoice.amountPaid = (invoice.amountPaid || 0) + amount;
        invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);
        invoice.status = invoice.balanceDue === 0 ? 'Payée' : 'Partiellement payée';
      }
    }

    this.saveLocalDb();
    return newPayment;
  }

  // ==========================================
  // DÉPENSES
  // ==========================================
  public getExpenses() {
    return [...this.inMemoryDb.expenses];
  }

  public createExpense(data: any) {
    const count = this.inMemoryDb.expenses.length + 1;
    const expenseNumber = data.expenseNumber?.trim() || `DEP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newExpense = {
      id: `exp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      expenseNumber,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'Autres',
      amount: Number(data.amount || 0),
      description: data.description?.trim() || 'Dépense',
      paymentMethod: data.paymentMethod || 'Espèces',
      beneficiary: data.beneficiary?.trim() || '',
      vehicleId: data.vehicleId || null,
      vehicleInfo: data.vehicleInfo || '',
      receiptRef: data.receiptRef?.trim() || '',
      notes: data.notes || '',
      recordedBy: data.recordedBy || 'Utilisateur',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryDb.expenses.unshift(newExpense);
    this.saveLocalDb();
    return newExpense;
  }

  public deleteExpense(id: string) {
    this.inMemoryDb.expenses = this.inMemoryDb.expenses.filter(e => e.id !== id);
    this.saveLocalDb();
    return { success: true };
  }

  // ==========================================
  // AUDIT & ACTIVITY LOGS
  // ==========================================
  public getActivityLogs() {
    return [...this.inMemoryDb.activityLogs];
  }

  public logActivity(entry: {
    userId: string;
    userName: string;
    userRole: string;
    actionType: string;
    module: string;
    description: string;
  }) {
    const log = {
      id: `log_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.inMemoryDb.activityLogs.unshift(log);
    // Keep last 1000 logs
    if (this.inMemoryDb.activityLogs.length > 1000) {
      this.inMemoryDb.activityLogs = this.inMemoryDb.activityLogs.slice(0, 1000);
    }
    this.saveLocalDb();
  }

  // ==========================================
  // DASHBOARD & REPORTS METRICS
  // ==========================================
  public getDashboardMetrics() {
    const vehicles = this.inMemoryDb.vehicles;
    const sales = this.inMemoryDb.sales;
    const reservations = this.inMemoryDb.reservations;
    const expenses = this.inMemoryDb.expenses;
    const payments = this.inMemoryDb.payments;

    const vehiclesInStock = vehicles.filter(v => v.status === 'Disponible' || v.status === 'En préparation').length;
    const vehiclesSold = vehicles.filter(v => v.status === 'Vendu').length;
    const vehiclesReserved = vehicles.filter(v => v.status === 'Réservé').length;

    // Total stock purchase value (available + reserved vehicles)
    const stockVehicles = vehicles.filter(v => v.status === 'Disponible' || v.status === 'Réservé' || v.status === 'En préparation');
    const totalStockValue = stockVehicles.reduce((sum, v) => sum + (v.totalCost || v.purchasePrice || 0), 0);
    const totalStockSellingValue = stockVehicles.reduce((sum, v) => sum + (v.sellingPrice || 0), 0);

    // Chiffre d'affaires (Total sales revenue)
    const turnover = sales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);

    // Total cash collected (payments)
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Total client debts (créances clients)
    const clientDebt = sales.reduce((sum, s) => sum + (s.balanceDue || 0), 0);

    // Real gross profit on sold vehicles:
    // Profit = Final sale price - Actual total cost of sold vehicles
    let totalGrossProfit = 0;
    for (const sale of sales) {
      const v = vehicles.find(veh => veh.id === sale.vehicleId);
      const cost = v ? (v.totalCost || v.purchasePrice || 0) : 0;
      totalGrossProfit += (sale.finalPrice - cost);
    }

    // Net real profit = Gross profit on sales - Total operating expenses
    const netProfit = totalGrossProfit - totalExpenses;

    // Monthly breakdown (last 12 months)
    const monthlyDataMap: Record<string, { month: string; salesCount: number; revenue: number; expenses: number; profit: number }> = {};

    // Initialize recent months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      monthlyDataMap[key] = { month: monthLabel, salesCount: 0, revenue: 0, expenses: 0, profit: 0 };
    }

    for (const s of sales) {
      const key = (s.saleDate || '').substring(0, 7);
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].salesCount += 1;
        monthlyDataMap[key].revenue += s.finalPrice;
        const v = vehicles.find(veh => veh.id === s.vehicleId);
        const cost = v ? (v.totalCost || v.purchasePrice || 0) : 0;
        monthlyDataMap[key].profit += (s.finalPrice - cost);
      }
    }

    for (const e of expenses) {
      const key = (e.date || '').substring(0, 7);
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].expenses += e.amount;
        monthlyDataMap[key].profit -= e.amount;
      }
    }

    return {
      vehiclesInStock,
      vehiclesSold,
      vehiclesReserved,
      totalVehicles: vehicles.length,
      totalStockValue,
      totalStockSellingValue,
      turnover,
      totalCollected,
      totalExpenses,
      clientDebt,
      totalGrossProfit,
      netProfit,
      monthlyTrends: Object.values(monthlyDataMap),
      currency: this.inMemoryDb.settings.currency || 'FCFA',
    };
  }

  // ==========================================
  // HOSTINGER / MYSQL FULL EXPORT & BACKUP
  // ==========================================
  public exportHostingerSqlScript(): string {
    let sql = UNIVERS_AUTO_MYSQL_SCHEMA;
    sql += `\n\n-- =====================================================================\n`;
    sql += `-- DONNÉES ACTUELLES DE L'APPLICATION (EXPORT POUR HOSTINGER)\n`;
    sql += `-- =====================================================================\n\n`;

    // Dump settings
    const s = this.inMemoryDb.settings;
    sql += `INSERT INTO \`company_settings\` (\`id\`, \`company_name\`, \`slogan\`, \`phone\`, \`whatsapp\`, \`email\`, \`address\`, \`city\`, \`country\`, \`rccm\`, \`ninea\`, \`currency\`, \`currency_symbol\`) VALUES (${this.escapeSql(s.id)}, ${this.escapeSql(s.companyName)}, ${this.escapeSql(s.slogan)}, ${this.escapeSql(s.phone)}, ${this.escapeSql(s.whatsapp)}, ${this.escapeSql(s.email)}, ${this.escapeSql(s.address)}, ${this.escapeSql(s.city)}, ${this.escapeSql(s.country)}, ${this.escapeSql(s.rccm)}, ${this.escapeSql(s.ninea)}, ${this.escapeSql(s.currency)}, ${this.escapeSql(s.currencySymbol)}) ON DUPLICATE KEY UPDATE \`company_name\`=VALUES(\`company_name\`);\n\n`;

    // Dump users
    for (const u of this.inMemoryDb.users) {
      sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`full_name\`, \`role\`, \`phone\`, \`email\`, \`commission_rate\`, \`monthly_target\`, \`is_active\`) VALUES (${this.escapeSql(u.id)}, ${this.escapeSql(u.username)}, ${this.escapeSql(u.password_hash)}, ${this.escapeSql(u.fullName)}, ${this.escapeSql(u.role)}, ${this.escapeSql(u.phone)}, ${this.escapeSql(u.email)}, ${u.commissionRate || 0}, ${u.monthlyTarget || 0}, ${u.isActive ? 1 : 0});\n`;
    }

    // Dump vehicles
    for (const v of this.inMemoryDb.vehicles) {
      sql += `INSERT INTO \`vehicles\` (\`id\`, \`reference\`, \`make\`, \`model\`, \`version\`, \`year\`, \`mileage\`, \`fuel_type\`, \`transmission\`, \`color\`, \`vin\`, \`registration\`, \`condition_type\`, \`supplier\`, \`purchase_price\`, \`transit_fee\`, \`customs_fee\`, \`transport_fee\`, \`repair_fee\`, \`other_fees\`, \`total_cost\`, \`selling_price\`, \`profit_margin\`, \`margin_rate\`, \`status\`, \`notes\`) VALUES (${this.escapeSql(v.id)}, ${this.escapeSql(v.reference)}, ${this.escapeSql(v.make)}, ${this.escapeSql(v.model)}, ${this.escapeSql(v.version)}, ${v.year}, ${v.mileage}, ${this.escapeSql(v.fuelType)}, ${this.escapeSql(v.transmission)}, ${this.escapeSql(v.color)}, ${this.escapeSql(v.vin)}, ${this.escapeSql(v.registration)}, ${this.escapeSql(v.condition)}, ${this.escapeSql(v.supplier)}, ${v.purchasePrice || 0}, ${v.transitFee || 0}, ${v.customsFee || 0}, ${v.transportFee || 0}, ${v.repairFee || 0}, ${v.otherFees || 0}, ${v.totalCost || 0}, ${v.sellingPrice || 0}, ${v.profitMargin || 0}, ${v.marginRate || 0}, ${this.escapeSql(v.status)}, ${this.escapeSql(v.notes)});\n`;
    }

    return sql;
  }

  private escapeSql(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  }

  public exportFullBackup(): StorageSchema {
    return JSON.parse(JSON.stringify(this.inMemoryDb));
  }

  public importFullBackup(data: Partial<StorageSchema>) {
    if (data.vehicles) this.inMemoryDb.vehicles = data.vehicles;
    if (data.purchases) this.inMemoryDb.purchases = data.purchases;
    if (data.sales) this.inMemoryDb.sales = data.sales;
    if (data.reservations) this.inMemoryDb.reservations = data.reservations;
    if (data.clients) this.inMemoryDb.clients = data.clients;
    if (data.invoices) this.inMemoryDb.invoices = data.invoices;
    if (data.payments) this.inMemoryDb.payments = data.payments;
    if (data.expenses) this.inMemoryDb.expenses = data.expenses;
    if (data.users) this.inMemoryDb.users = data.users;
    if (data.settings) this.inMemoryDb.settings = { ...this.inMemoryDb.settings, ...data.settings };
    this.saveLocalDb();
    return { success: true };
  }
}

export const db = new DatabaseManager();
