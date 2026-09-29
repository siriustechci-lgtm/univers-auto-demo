import { Router, Request, Response } from 'express';
import { db } from './db';

export const apiRouter = Router();

// ==========================================
// SYSTEM & HEALTH
// ==========================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'UNIVERS AUTO CRM Backend API',
    database: db.getStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// DATABASE & HOSTINGER CONFIGURATION
// ==========================================
apiRouter.get('/database/status', (req: Request, res: Response) => {
  res.json(db.getStatus());
});

apiRouter.post('/database/test', async (req: Request, res: Response) => {
  const { host, port, user, password, database } = req.body;
  if (!host || !user || !database) {
    res.status(400).json({ success: false, message: 'Hôte, utilisateur et nom de base de données requis.' });
    return;
  }
  const result = await db.testConnection({
    host,
    port: Number(port) || 3306,
    user,
    password: password || '',
    database,
  });
  res.json(result);
});

apiRouter.post('/database/connect', async (req: Request, res: Response) => {
  const { host, port, user, password, database } = req.body;
  if (!host || !user || !database) {
    res.status(400).json({ success: false, message: 'Paramètres MySQL incomplets.' });
    return;
  }
  const result = await db.connectMySql({
    host,
    port: Number(port) || 3306,
    user,
    password: password || '',
    database,
  });
  res.json(result);
});

apiRouter.get('/database/export-sql', (req: Request, res: Response) => {
  const sql = db.exportHostingerSqlScript();
  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', `attachment; filename="univers_auto_hostinger_${new Date().toISOString().split('T')[0]}.sql"`);
  res.send(sql);
});

apiRouter.post('/database/migrate', async (req: Request, res: Response) => {
  const result = await db.runMigrations();
  res.json(result);
});

apiRouter.get('/backup/export', (req: Request, res: Response) => {
  const backup = db.exportFullBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="univers_auto_backup_${Date.now()}.json"`);
  res.json(backup);
});

apiRouter.post('/backup/import', (req: Request, res: Response) => {
  try {
    const data = req.body;
    db.importFullBackup(data);
    res.json({ success: true, message: 'Sauvegarde restaurée avec succès' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// AUTHENTICATION & USERS
// ==========================================
apiRouter.get('/auth/setup-status', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({
    isConfigured: users.length > 0,
    userCount: users.length,
    hasAdmin: users.some(u => u.role === 'Administrateur'),
  });
});

apiRouter.post('/auth/register-admin', (req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    if (users.length > 0) {
      res.status(403).json({ error: 'La configuration initiale a déjà été effectuée.' });
      return;
    }

    const { username, password, fullName, phone, email } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ error: 'Nom, nom d\'utilisateur et mot de passe sont requis.' });
      return;
    }

    const admin = db.createUser({
      username,
      password,
      fullName,
      phone: phone || '',
      email: email || '',
      role: 'Administrateur',
      isActive: true,
      permissions: ['all'],
    });

    res.json({ success: true, user: admin });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    return;
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    return;
  }

  if (user.isActive === false) {
    res.status(403).json({ error: 'Ce compte est désactivé. Veuillez contacter l\'administrateur.' });
    return;
  }

  const isValid = db.verifyPassword(user, password);
  if (!isValid) {
    res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    return;
  }

  // Update last login
  db.updateUser(user.id, { lastLogin: new Date().toISOString() });
  const safeUser = db.getUserById(user.id);

  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    actionType: 'Connexion',
    module: 'Sécurité',
    description: `Connexion réussie de ${user.fullName} (${user.role})`,
  });

  res.json({ success: true, user: safeUser });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

apiRouter.post('/auth/users', (req: Request, res: Response) => {
  try {
    const newUser = db.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/auth/users/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/auth/users/:id', (req: Request, res: Response) => {
  try {
    db.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// VÉHICULES (PARC AUTOMOBILE)
// ==========================================
apiRouter.get('/vehicles', (req: Request, res: Response) => {
  res.json(db.getVehicles());
});

apiRouter.get('/vehicles/:id', (req: Request, res: Response) => {
  const vehicle = db.getVehicleById(req.params.id);
  if (!vehicle) {
    res.status(404).json({ error: 'Véhicule non trouvé' });
    return;
  }
  res.json(vehicle);
});

apiRouter.post('/vehicles', (req: Request, res: Response) => {
  try {
    const vehicle = db.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/vehicles/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateVehicle(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/vehicles/:id', (req: Request, res: Response) => {
  try {
    db.deleteVehicle(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ACHATS & APPROVISIONNEMENTS
// ==========================================
apiRouter.get('/purchases', (req: Request, res: Response) => {
  res.json(db.getPurchases());
});

apiRouter.post('/purchases', (req: Request, res: Response) => {
  try {
    const purchase = db.createPurchase(req.body);
    res.status(201).json(purchase);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/purchases/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updatePurchase(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/purchases/:id', (req: Request, res: Response) => {
  try {
    db.deletePurchase(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// VENTES
// ==========================================
apiRouter.get('/sales', (req: Request, res: Response) => {
  res.json(db.getSales());
});

apiRouter.post('/sales', (req: Request, res: Response) => {
  try {
    const sale = db.createSale(req.body);
    res.status(201).json(sale);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/sales/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateSale(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/sales/:id', (req: Request, res: Response) => {
  try {
    db.deleteSale(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RÉSERVATIONS
// ==========================================
apiRouter.get('/reservations', (req: Request, res: Response) => {
  res.json(db.getReservations());
});

apiRouter.post('/reservations', (req: Request, res: Response) => {
  try {
    const resv = db.createReservation(req.body);
    res.status(201).json(resv);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/reservations/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateReservation(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// CLIENTS
// ==========================================
apiRouter.get('/clients', (req: Request, res: Response) => {
  res.json(db.getClients());
});

apiRouter.get('/clients/:id', (req: Request, res: Response) => {
  const client = db.getClientById(req.params.id);
  if (!client) {
    res.status(404).json({ error: 'Client non trouvé' });
    return;
  }
  res.json(client);
});

apiRouter.post('/clients', (req: Request, res: Response) => {
  try {
    const client = db.createClient(req.body);
    res.status(201).json(client);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/clients/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateClient(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/clients/:id', (req: Request, res: Response) => {
  try {
    db.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// FACTURES & DEVIS
// ==========================================
apiRouter.get('/invoices', (req: Request, res: Response) => {
  res.json(db.getInvoices());
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  try {
    const invoice = db.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PAIEMENTS & ENCAISSEMENTS
// ==========================================
apiRouter.get('/payments', (req: Request, res: Response) => {
  res.json(db.getPayments());
});

apiRouter.post('/payments', (req: Request, res: Response) => {
  try {
    const payment = db.createPayment(req.body);
    res.status(201).json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DÉPENSES
// ==========================================
apiRouter.get('/expenses', (req: Request, res: Response) => {
  res.json(db.getExpenses());
});

apiRouter.post('/expenses', (req: Request, res: Response) => {
  try {
    const expense = db.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/expenses/:id', (req: Request, res: Response) => {
  try {
    db.deleteExpense(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// TABLEAU DE BORD & RAPPORTS
// ==========================================
apiRouter.get('/reports/metrics', (req: Request, res: Response) => {
  res.json(db.getDashboardMetrics());
});

apiRouter.get('/activity-logs', (req: Request, res: Response) => {
  res.json(db.getActivityLogs());
});

// ==========================================
// PARAMÈTRES DE L'ENTREPRISE
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
