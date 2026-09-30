import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import { apiRouter } from './server/routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Mount CRM API Router
app.use('/api', apiRouter);

// Helper to get Gemini client lazily
let genAiClient: GoogleGenAI | null = null;
function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'UNIVERS AUTO CRM API' });
});

// AI Query Endpoint
app.post('/api/ai/query', async (req, res) => {
  try {
    const { prompt, conversationHistory = [], crmData } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Question manquante' });
      return;
    }

    const ai = getGenAiClient();

    // If Gemini is available on server, use Gemini 3.7 Flash for intelligent answering
    if (ai) {
      try {
        const role = crmData?.currentUser?.role || 'Administrateur';
        const userFullName = crmData?.currentUser?.fullName || 'Utilisateur';
        const companyName = crmData?.settings?.companyName || 'Sirius Auto';
        const currency = crmData?.settings?.currencySymbol || crmData?.settings?.currency || 'EUR';

        // Prepare context data respecting role restrictions
        const isRestrictedRole = role === 'Commercial';
        const vehicles = crmData?.vehicles || [];
        const clients = crmData?.clients || [];
        const sales = crmData?.sales || [];
        const rentals = crmData?.rentals || [];
        const payments = isRestrictedRole ? [] : (crmData?.payments || []);
        const expenses = isRestrictedRole ? [] : (crmData?.expenses || []);
        const otherRevenues = isRestrictedRole ? [] : (crmData?.otherRevenues || []);
        const reservations = crmData?.reservations || [];
        const maintenances = crmData?.maintenances || [];
        const suppliers = crmData?.suppliers || [];
        const prospects = crmData?.prospects || [];

        // Compact snapshot summary for model context
        const contextPayload = {
          role,
          userFullName,
          companyName,
          currency,
          dateToday: new Date().toISOString().split('T')[0],
          counts: {
            vehiclesTotal: vehicles.length,
            vehiclesDisponibles: vehicles.filter((v: any) => v.status === 'Disponible').length,
            vehiclesLoues: vehicles.filter((v: any) => v.status === 'Loué').length,
            vehiclesVendus: vehicles.filter((v: any) => v.status === 'Vendu').length,
            vehiclesMaintenance: vehicles.filter((v: any) => v.status === 'En maintenance').length,
            vehiclesReserves: vehicles.filter((v: any) => v.status === 'Réservé').length,
            clientsTotal: clients.length,
            salesTotal: sales.length,
            rentalsTotal: rentals.length,
            rentalsEnCours: rentals.filter((r: any) => r.status === 'En cours').length,
            reservationsTotal: reservations.length,
            maintenancesTotal: maintenances.length,
            prospectsTotal: prospects.length,
          },
          vehicles: vehicles.slice(0, 100).map((v: any) => ({
            id: v.id,
            name: `${v.make} ${v.model} (${v.year})`,
            registration: v.registration,
            status: v.status,
            dailyRate: v.dailyRate,
            sellingPrice: v.sellingPrice,
            mileage: v.mileage,
            fuelType: v.fuelType,
            usage: v.usage,
            techInspectionExp: v.technicalInspectionExpiryDate,
          })),
          clients: clients.slice(0, 100).map((c: any) => ({
            id: c.id,
            name: c.fullName || `${c.firstName} ${c.lastName}`.trim() || c.companyName,
            phone: c.phone,
            email: c.email,
            status: c.status,
          })),
          sales: sales.slice(0, 100).map((s: any) => ({
            id: s.id,
            saleNumber: s.saleNumber,
            vehicle: s.vehicleName,
            client: s.clientName,
            date: s.saleDate,
            totalAmount: s.totalAmount || s.salePrice,
            amountPaid: s.amountPaid,
            balanceDue: s.balanceDue,
            paymentStatus: s.paymentStatus,
          })),
          rentals: rentals.slice(0, 100).map((r: any) => ({
            id: r.id,
            rentalNumber: r.rentalNumber,
            vehicle: r.vehicleName,
            client: r.clientName,
            clientPhone: r.clientPhone,
            startDate: r.startDate,
            endDate: r.endDate,
            durationDays: r.durationDays,
            totalAmount: r.totalAmount,
            amountPaid: r.amountPaid,
            balanceDue: r.balanceDue,
            status: r.status,
            paymentStatus: r.paymentStatus,
            depositAmount: r.depositAmount,
          })),
          payments: payments.slice(0, 100).map((p: any) => ({
            id: p.id,
            paymentNumber: p.paymentNumber,
            client: p.clientName,
            amount: p.amount,
            date: p.paymentDate || p.date,
            method: p.paymentMethod,
            status: p.status,
            referenceTitle: p.referenceTitle,
          })),
          expenses: expenses.slice(0, 100).map((e: any) => ({
            id: e.id,
            category: e.category,
            amount: e.amount,
            date: e.date,
            description: e.description,
          })),
          reservations: reservations.slice(0, 50).map((res: any) => ({
            id: res.id,
            reservationNumber: res.reservationNumber,
            client: res.clientName,
            vehicle: res.vehicleName,
            startDate: res.startDate,
            endDate: res.endDate,
            status: res.status,
          })),
          prospects: prospects.slice(0, 50).map((pr: any) => ({
            id: pr.id,
            name: pr.name,
            phone: pr.phone,
            status: pr.status,
            needType: pr.needType,
            budget: pr.budget,
          })),
          maintenances: maintenances.slice(0, 50).map((m: any) => ({
            id: m.id,
            ref: m.referenceNumber,
            vehicle: m.vehicleName,
            type: m.type,
            supplier: m.supplier,
            amount: m.amount,
            status: m.status,
            date: m.date,
          })),
        };

        const systemInstruction = `Tu es l'Assistant IA officiel et intégré de Sirius Auto CRM (logiciel de gestion et CRM pour concessions automobiles et agences de location de véhicules).
Ton identité visible est uniquement : "Assistant IA" (ou "ASSISTANT IA").

DIRECTIVES FONDAMENTALES :
1. ANALYSE PRÉCISE DU MESSAGE :
- Si l'utilisateur salue ("Bonjour", "Salut", "Bonsoir", "Hello"), réponds naturellement par exemple "Bonjour ! Comment puis-je vous aider ?" ou "Bonjour ! Comment puis-je vous assister aujourd'hui ?". Ne réponds JAMAIS qu'il n'y a pas de données pour un simple salut ou message de politesse.
- Si l'utilisateur demande "Comment vas-tu ?", "Merci", "Que peux-tu faire ?", réponds courtoisement et naturellement.
- Si l'utilisateur pose une question sur le CRM ("Quels véhicules sont disponibles ?", "Combien avons-nous vendu ce mois-ci ?", "Combien avons-nous encaissé aujourd'hui ?", "Quels contrats sont actuellement actifs ?", etc.), analyse rigoureusement les données réelles du contexte JSON fourni.
- Si et seulement si la question porte sur des données du CRM et que la base de données ne contient aucun enregistrement pour cette entité, réponds courtoisement : "Je n'ai encore aucune donnée enregistrée dans votre CRM pour répondre à cette question." (ou équivalent naturel adapté à l'entité demandée).

2. DONNÉES RÉELLES & AUCUNE DONNÉE FICTIVE :
- Ne JAMAIS inventer de données, faux véhicules, faux clients ou fausses transactions.
- Toutes les données chiffrées doivent provenir du contexte JSON fourni.

3. CONFIDENTIALITÉ & SÉCURITÉ :
- NE JAMAIS mentionner Gemini, Google, Google AI, API Key, clé API, modèle IA, LLM, token, ou toute technologie sous-jacente.
- Respecter le rôle utilisateur (${role}). Si le rôle est restreint ('Commercial'), les données financières sensibles globales restent protégées.

4. FORMAT & STYLE :
- En français, professionnel, clair, synthétique.
- Privilégie les puces • et montants formatés avec la devise (${currency}).
- Remplis le schéma JSON avec des cartes d'indicateurs (statsCards) et liens d'action (actionLinks) si approprié.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Historique récent de la conversation : ${JSON.stringify(
                    conversationHistory.slice(-4)
                  )}\n\nDonnées CRM actuelles en temps réel :\n${JSON.stringify(
                    contextPayload
                  )}\n\nQuestion de l'utilisateur : "${prompt}"`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                content: {
                  type: Type.STRING,
                  description: 'Texte markdown de la réponse, clair, concis et précis.',
                },
                category: {
                  type: Type.STRING,
                  description: 'Catégorie de la réponse (ventes, locations, clients, paiements, vehicules, resume, alertes, general).',
                },
                statsCards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      type: { type: Type.STRING, description: 'positive, negative, warning, neutral' },
                    },
                    required: ['label', 'value'],
                  },
                },
                tableData: {
                  type: Type.OBJECT,
                  properties: {
                    headers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    rows: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                },
                actionLinks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      tab: { type: Type.STRING },
                    },
                    required: ['label', 'tab'],
                  },
                },
              },
              required: ['content', 'category'],
            },
          },
        });

        const rawText = response.text?.trim();
        if (rawText) {
          const parsed = JSON.parse(rawText);
          res.json({
            content: parsed.content || 'Voici les informations demandées.',
            category: parsed.category || 'general',
            statsCards: parsed.statsCards || [],
            tableData: parsed.tableData || undefined,
            actionLinks: parsed.actionLinks || [],
          });
          return;
        }
      } catch (genErr) {
        console.error('Gemini query error, falling back to local deterministic response:', genErr);
      }
    }

    // Fallback indicator (deterministic response handled on client)
    res.json({ fallback: true });
  } catch (error) {
    console.error('Server AI query error:', error);
    res.status(500).json({ error: 'Erreur lors du traitement de la requête' });
  }
});

// Setup Vite or Static serving
async function startServer() {
  // Initialize Database (MySQL or persistent server store)
  await db.init();

  const isCompiledServer = path.basename(process.argv[1] || '') === 'server.cjs';

  if (process.env.NODE_ENV !== 'production' && !isCompiledServer) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.dirname(path.resolve(process.argv[1] || 'dist/server.cjs'));
    const indexPath = path.join(distPath, 'index.html');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Route API introuvable' });
        return;
      }

      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏎️ UNIVERS AUTO CRM Server running on port ${PORT}`);
  });
}

startServer();
