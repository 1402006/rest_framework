const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "db.json");
const AVERAGE_SERVICE_MINUTES = 4;

const app = express();
app.use(cors());
app.use(express.json());

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Tri : tickets prioritaires d'abord, puis FIFO par date de création.
function compareTickets(a, b) {
  const pa = a.priority === "high" ? 0 : 1;
  const pb = b.priority === "high" ? 0 : 1;
  if (pa !== pb) return pa - pb;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

function groupWaiting(db, agencyId, serviceId) {
  return db.tickets
    .filter((t) => t.status === "waiting" && t.agencyId === agencyId && t.serviceId === serviceId)
    .sort(compareTickets);
}

// Position et attente estimée : calculées par agence ET par service, en
// tenant compte de la priorité (un ticket prioritaire "passe devant" les
// tickets normaux déjà en attente, mais pas devant un autre prioritaire
// arrivé avant lui).
function recomputePositions(db) {
  const groups = new Map();
  db.tickets
    .filter((t) => t.status === "waiting")
    .forEach((t) => {
      const key = `${t.agencyId}|${t.serviceId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });

  groups.forEach((list) => {
    list.sort(compareTickets);
    list.forEach((t, index) => {
      t.position = index + 1;
      t.estimatedWaitMinutes = (index + 1) * AVERAGE_SERVICE_MINUTES;
    });
  });
}

// Appelle automatiquement le prochain client (prioritaire puis FIFO, par
// agence + service) sur chaque guichet libre — remplace l'appel manuel.
function autoAssign(db) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const counter of db.counters) {
      if (counter.currentTicketNumber !== null) continue;

      const next = groupWaiting(db, counter.agencyId, counter.serviceId)[0];
      if (!next) continue;

      next.status = "called";
      next.counterId = counter.id;
      counter.currentTicketNumber = next.number;
      changed = true;
    }
  }
  recomputePositions(db);
}

function buildSnapshot(db, agencyId) {
  const counters = agencyId ? db.counters.filter((c) => c.agencyId === agencyId) : db.counters;
  const scopedTickets = agencyId ? db.tickets.filter((t) => t.agencyId === agencyId) : db.tickets;
  const waiting = scopedTickets.filter((t) => t.status === "waiting").sort(compareTickets);

  const activeByCounter = {};
  counters.forEach((c) => {
    activeByCounter[c.id] = db.tickets.find((t) => t.status === "called" && t.counterId === c.id) || null;
  });

  return {
    counters,
    upcoming: waiting.slice(0, 5),
    waiting,
    activeByCounter,
  };
}

// --- Agences -----------------------------------------------------------------

app.get("/api/agencies", (req, res) => {
  const db = readDb();
  res.json(db.agencies.map(({ id, name, city }) => ({ id, name, city })));
});

// --- Services --------------------------------------------------------------

app.get("/api/services", (req, res) => {
  const db = readDb();
  res.json(db.services);
});

// --- File d'attente ---------------------------------------------------------

app.get("/api/queue/current", (req, res) => {
  const db = readDb();
  res.json(buildSnapshot(db, req.query.agencyId));
});

// --- Tickets -----------------------------------------------------------------

app.post("/api/tickets", (req, res) => {
  const { agencyId, serviceId, clientInfo, serviceDetails, priority, priorityReason } = req.body;
  const db = readDb();

  const agency = db.agencies.find((a) => a.id === agencyId);
  if (!agency) return res.status(400).json({ error: "Agence inconnue" });

  const service = db.services.find((s) => s.id === serviceId);
  if (!service) return res.status(400).json({ error: "Service inconnu" });

  agency.ticketSeq += 1;
  const ticket = {
    id: crypto.randomUUID(),
    number: `A${String(agency.ticketSeq).padStart(3, "0")}`,
    agencyId: agency.id,
    agencyName: agency.name,
    agencyCity: agency.city,
    serviceId: service.id,
    serviceName: service.name,
    status: "waiting",
    priority: priority === "high" ? "high" : "normal",
    priorityReason: priority === "high" && priorityReason ? priorityReason : "none",
    position: 0,
    estimatedWaitMinutes: 0,
    counterId: null,
    createdAt: new Date().toISOString(),
    clientInfo: clientInfo || undefined,
    serviceDetails: serviceDetails || undefined,
  };
  db.tickets.push(ticket);
  autoAssign(db);
  writeDb(db);
  res.status(201).json(ticket);
});

app.get("/api/tickets/:id", (req, res) => {
  const db = readDb();
  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });
  res.json(ticket);
});

app.post("/api/tickets/:id/resolve", (req, res) => {
  const { outcome } = req.body; // "served" | "cancelled"
  const db = readDb();

  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });

  const counter = db.counters.find((c) => c.id === ticket.counterId);
  ticket.status = outcome;
  ticket.counterId = null;
  if (counter) counter.currentTicketNumber = null;

  autoAssign(db);
  writeDb(db);
  res.json(ticket);
});

app.post("/api/tickets/:id/requeue", (req, res) => {
  const db = readDb();

  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });

  const counter = db.counters.find((c) => c.id === ticket.counterId);
  ticket.status = "waiting";
  ticket.counterId = null;
  if (counter) counter.currentTicketNumber = null;

  autoAssign(db);
  writeDb(db);
  res.json(ticket);
});

app.post("/api/tickets/:id/transfer", (req, res) => {
  const { serviceId } = req.body;
  const db = readDb();

  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });

  const targetService = db.services.find((s) => s.id === serviceId);
  if (!targetService) return res.status(400).json({ error: "Service inconnu" });

  const previousCounter = db.counters.find((c) => c.id === ticket.counterId);
  if (previousCounter) previousCounter.currentTicketNumber = null;

  ticket.serviceId = targetService.id;
  ticket.serviceName = targetService.name;
  ticket.status = "waiting";
  ticket.counterId = null;

  autoAssign(db);
  writeDb(db);
  res.json(ticket);
});

app.post("/api/tickets/:id/feedback", (req, res) => {
  const { rating, comment } = req.body;
  const db = readDb();

  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });
  if (ticket.status !== "served") {
    return res.status(400).json({ error: "Cette demande n'a pas encore été traitée" });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Note invalide (1 à 5)" });
  }

  ticket.feedback = {
    rating,
    comment: comment && comment.trim() ? comment.trim() : undefined,
    submittedAt: new Date().toISOString(),
  };

  writeDb(db);
  res.json(ticket);
});

const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock backend (JSON) démarré sur http://localhost:${PORT}`);
  console.log("Accessible aussi depuis le réseau local via votre IP (ex: http://192.168.x.x:3001)");
});
