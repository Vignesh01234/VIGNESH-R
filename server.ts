import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DB, initDatabase } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDatabase();

  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper to extract acting user from header
  const getActingUser = (req: express.Request) => {
    return (req.headers['x-user-name'] as string) || 'Admin';
  };

  // --- API Endpoints ---

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(DB.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = DB.updateSettings(req.body, getActingUser(req));
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Next LR Number
  app.get('/api/lr/next-number', (req, res) => {
    res.json({ nextLrNumber: DB.getNextLRNumber() });
  });

  // LRs
  app.get('/api/lr', (req, res) => {
    let lrs = DB.getLRs();
    const { search, status, paymentType, fromCity, toCity, startDate, endDate, party } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      lrs = lrs.filter(l => 
        l.lrNumber.toLowerCase().includes(q) ||
        l.consignorName.toLowerCase().includes(q) ||
        l.consigneeName.toLowerCase().includes(q) ||
        l.vehicleNumber.toLowerCase().includes(q) ||
        l.fromCity.toLowerCase().includes(q) ||
        l.toCity.toLowerCase().includes(q) ||
        (l.invoiceNumber && l.invoiceNumber.toLowerCase().includes(q))
      );
    }

    if (status && typeof status === 'string' && status !== 'All') {
      lrs = lrs.filter(l => l.status === status);
    }

    if (paymentType && typeof paymentType === 'string' && paymentType !== 'All') {
      lrs = lrs.filter(l => l.paymentType === paymentType);
    }

    if (fromCity && typeof fromCity === 'string') {
      lrs = lrs.filter(l => l.fromCity.toLowerCase() === fromCity.toLowerCase());
    }

    if (toCity && typeof toCity === 'string') {
      lrs = lrs.filter(l => l.toCity.toLowerCase() === toCity.toLowerCase());
    }

    if (party && typeof party === 'string') {
      const p = party.toLowerCase();
      lrs = lrs.filter(l => l.consignorName.toLowerCase().includes(p) || l.consigneeName.toLowerCase().includes(p));
    }

    if (startDate && typeof startDate === 'string') {
      lrs = lrs.filter(l => l.lrDate >= startDate);
    }

    if (endDate && typeof endDate === 'string') {
      lrs = lrs.filter(l => l.lrDate <= endDate);
    }

    res.json(lrs);
  });

  app.get('/api/lr/:id', (req, res) => {
    const lr = DB.getLRById(req.params.id);
    if (!lr) return res.status(404).json({ error: 'LR not found' });
    res.json(lr);
  });

  app.post('/api/lr', (req, res) => {
    try {
      const lr = DB.saveLR(req.body, getActingUser(req));
      res.json(lr);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/lr/:id/status', (req, res) => {
    try {
      const { status, details } = req.body;
      const lr = DB.updateLRStatus(req.params.id, status, details, getActingUser(req));
      res.json(lr);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/lr/:id', (req, res) => {
    try {
      const { reason } = req.body;
      const lr = DB.cancelLR(req.params.id, reason || 'Cancelled by user', getActingUser(req));
      res.json(lr);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Parties
  app.get('/api/parties', (req, res) => {
    res.json(DB.getParties());
  });

  app.post('/api/parties', (req, res) => {
    try {
      const party = DB.saveParty(req.body, getActingUser(req));
      res.json(party);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/parties/:id', (req, res) => {
    try {
      DB.deleteParty(req.params.id, getActingUser(req));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Vehicles
  app.get('/api/vehicles', (req, res) => {
    res.json(DB.getVehicles());
  });

  app.post('/api/vehicles', (req, res) => {
    try {
      const veh = DB.saveVehicle(req.body, getActingUser(req));
      res.json(veh);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    try {
      DB.deleteVehicle(req.params.id, getActingUser(req));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Drivers
  app.get('/api/drivers', (req, res) => {
    res.json(DB.getDrivers());
  });

  app.post('/api/drivers', (req, res) => {
    try {
      const drv = DB.saveDriver(req.body, getActingUser(req));
      res.json(drv);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/drivers/:id', (req, res) => {
    try {
      DB.deleteDriver(req.params.id, getActingUser(req));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Cities & Routes
  app.get('/api/cities', (req, res) => {
    res.json(DB.getCities());
  });

  app.post('/api/cities', (req, res) => {
    try {
      const c = DB.saveCity(req.body, getActingUser(req));
      res.json(c);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/routes', (req, res) => {
    res.json(DB.getRoutes());
  });

  app.post('/api/routes', (req, res) => {
    try {
      const r = DB.saveRoute(req.body, getActingUser(req));
      res.json(r);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Payments
  app.get('/api/payments', (req, res) => {
    res.json(DB.getPayments());
  });

  app.post('/api/payments', (req, res) => {
    try {
      const pay = DB.recordPayment(req.body, getActingUser(req));
      res.json(pay);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/payments/:id', (req, res) => {
    try {
      DB.deletePayment(req.params.id, getActingUser(req));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Customer Ledger
  app.get('/api/ledger/:party', (req, res) => {
    const { startDate, endDate } = req.query;
    const ledger = DB.getPartyLedger(
      req.params.party, 
      typeof startDate === 'string' ? startDate : undefined, 
      typeof endDate === 'string' ? endDate : undefined
    );
    res.json(ledger);
  });

  // Expenses
  app.get('/api/expenses', (req, res) => {
    res.json(DB.getExpenses());
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const exp = DB.saveExpense(req.body, getActingUser(req));
      res.json(exp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      DB.deleteExpense(req.params.id, getActingUser(req));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Users
  app.get('/api/users', (req, res) => {
    res.json(DB.getUsers());
  });

  app.post('/api/users', (req, res) => {
    try {
      const u = DB.saveUser(req.body, getActingUser(req));
      res.json(u);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(DB.getAuditLogs());
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    const lrs = DB.getLRs();
    const payments = DB.getPayments();
    const expenses = DB.getExpenses();

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    const activeLRs = lrs.filter(l => l.status !== 'Cancelled');
    const cancelledLRs = lrs.filter(l => l.status === 'Cancelled');

    const todayLRs = activeLRs.filter(l => l.lrDate === todayStr);
    const thisMonthLRs = activeLRs.filter(l => l.lrDate.startsWith(currentMonthStr));

    const totalPackagesBooked = activeLRs.reduce((sum, l) => sum + (l.totalPackages || 0), 0);
    const totalWeightBooked = activeLRs.reduce((sum, l) => sum + (l.totalWeight || 0), 0);
    const totalFreightBilled = activeLRs.reduce((sum, l) => sum + (l.grandTotal || 0), 0);
    const totalPaymentsCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstandingBalance = activeLRs.reduce((sum, l) => sum + (l.balanceDue || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const toPayLRsCount = activeLRs.filter(l => l.paymentType === 'To Pay' && l.paymentStatus !== 'Paid').length;
    const paidLRsCount = activeLRs.filter(l => l.paymentStatus === 'Paid').length;
    const inTransitLRsCount = activeLRs.filter(l => l.status === 'In Transit').length;
    const deliveredLRsCount = activeLRs.filter(l => l.status === 'Delivered').length;

    // Route wise summary
    const routeMap: Record<string, { count: number; freight: number; weight: number }> = {};
    for (const lr of activeLRs) {
      const rKey = `${lr.fromCity} -> ${lr.toCity}`;
      if (!routeMap[rKey]) {
        routeMap[rKey] = { count: 0, freight: 0, weight: 0 };
      }
      routeMap[rKey].count++;
      routeMap[rKey].freight += lr.grandTotal;
      routeMap[rKey].weight += lr.totalWeight;
    }

    const routeSummary = Object.entries(routeMap)
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.freight - a.freight)
      .slice(0, 5);

    res.json({
      totalLRsToday: todayLRs.length,
      totalLRsThisMonth: thisMonthLRs.length,
      totalPackagesBooked,
      totalWeightBooked,
      totalFreightBilled,
      totalPaymentsCollected,
      totalOutstandingBalance,
      totalExpenses,
      toPayLRsCount,
      paidLRsCount,
      inTransitLRsCount,
      deliveredLRsCount,
      cancelledLRsCount: cancelledLRs.length,
      recentLRs: lrs.slice(0, 6),
      recentPayments: payments.slice(0, 6),
      routeSummary
    });
  });

  // Backup & Reset
  app.get('/api/backup/export', (req, res) => {
    const backup = DB.exportBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sri_murugan_transport_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(backup, null, 2));
  });

  app.post('/api/backup/import', (req, res) => {
    try {
      DB.importBackup(req.body, getActingUser(req));
      res.json({ success: true, message: 'Database restored successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/reset-demo', (req, res) => {
    try {
      DB.resetDemoData(getActingUser(req));
      res.json({ success: true, message: 'Demo data reset to factory initial state' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Serve Frontend ---
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Sri Murugan Transport server active on port ${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
