// Point d'entrée unique pour les données de la file d'attente — branché
// sur l'API Django réelle (rest_framework-backend_stable).
//
// Deux catégories d'appels :
// - publics (fetch direct) : services, création de ticket, suivi par code
// - protégés (authFetch)   : tout ce qui touche guichets/agents/actions ticket

import { API_BASE_URL } from "./config";
import { authFetch, getAccessToken, getUserIdFromToken } from "./auth";
import type {
  ApiAgent,
  ApiGuichetDetail,
  ApiService,
  ApiTicket,
  ApiTicketStatus,
  AgentStatus,
  CreateTicketPayload,
} from "../types/api";

const POLL_INTERVAL_MS = 2000;

async function publicRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Erreur réseau (${res.status})`);
  }
  return res.json();
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await authFetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Erreur réseau (${res.status})`);
  }
  return res.json();
}

// --- Public : services, création de ticket, suivi -------------------------

export function getServices(): Promise<ApiService[]> {
  return publicRequest<ApiService[]>("/services/");
}

export function createTicket(payload: CreateTicketPayload): Promise<ApiTicket> {
  return publicRequest<ApiTicket>("/tickets/create/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTicketByCode(code: string): Promise<ApiTicket | null> {
  return publicRequest<ApiTicket>(`/tickets/status/${code}/`).catch(() => null);
}

// --- Protégé : guichets -----------------------------------------------------

export function getGuichets(): Promise<ApiGuichetDetail[]> {
  return authRequest<ApiGuichetDetail[]>("/guichets/");
}

// Liste des tickets visibles par l'agent/admin, filtrable par guichet/statut.
// Sert à la fois à prévisualiser la file d'attente et à retrouver le ticket
// actif de l'agent après un rechargement de page (pas d'endpoint dédié
// "mon ticket en cours" côté API).
export function authFetchTickets(params: { guichet?: number; status?: ApiTicketStatus }): Promise<ApiTicket[]> {
  const query = new URLSearchParams();
  if (params.guichet !== undefined) query.set("guichet", String(params.guichet));
  if (params.status) query.set("status", params.status);
  const qs = query.toString();
  return authRequest<ApiTicket[]>(`/tickets/${qs ? `?${qs}` : ""}`);
}

// --- Protégé : agent connecté ------------------------------------------------
//
// GET /token/user/me/ renvoie TOUS les utilisateurs (bug backend — la vue
// utilise ListAPIView sur tout le queryset User au lieu de request.user).
// On contourne en décodant le user_id du JWT et en filtrant côté client.
export async function getCurrentAgent(): Promise<ApiAgent | null> {
  const userId = getUserIdFromToken();
  if (!userId || !getAccessToken()) return null;
  const users = await authRequest<ApiAgent[]>("/token/user/me/");
  return users.find((u) => u.id === userId) ?? null;
}

export function updateMyStatus(agent_status: AgentStatus): Promise<ApiAgent> {
  return authRequest<ApiAgent>("/agents/me/status/", {
    method: "PATCH",
    body: JSON.stringify({ agent_status }),
  });
}

// --- Protégé : cycle de vie du ticket (agent) --------------------------------

export function callNextTicket(): Promise<ApiTicket> {
  return authRequest<ApiTicket>("/tickets/call-next/", { method: "POST" });
}

export function startTicket(id: number): Promise<ApiTicket> {
  return authRequest<ApiTicket>(`/tickets/${id}/start/`, { method: "POST" });
}

export function completeTicket(id: number): Promise<ApiTicket> {
  return authRequest<ApiTicket>(`/tickets/${id}/complete/`, { method: "POST" });
}

export function markAbsentTicket(id: number): Promise<ApiTicket> {
  return authRequest<ApiTicket>(`/tickets/${id}/absent/`, { method: "POST" });
}

export function cancelTicket(id: number): Promise<ApiTicket> {
  return authRequest<ApiTicket>(`/tickets/${id}/cancel/`, { method: "POST" });
}

export function transferTicket(id: number, guichetId: number): Promise<ApiTicket> {
  return authRequest<ApiTicket>(`/tickets/${id}/transfer/`, {
    method: "POST",
    body: JSON.stringify({ guichet: guichetId }),
  });
}

// --- Abonnements "temps réel" (polling — pas de WebSocket côté Django) ------

export function subscribeToTicketByCode(
  code: string,
  cb: (ticket: ApiTicket | null) => void,
): () => void {
  let cancelled = false;
  async function poll() {
    const ticket = await getTicketByCode(code);
    if (!cancelled) cb(ticket);
  }
  poll();
  const id = setInterval(poll, POLL_INTERVAL_MS);
  return () => {
    cancelled = true;
    clearInterval(id);
  };
}

export function subscribeToGuichets(cb: (guichets: ApiGuichetDetail[]) => void): () => void {
  let cancelled = false;
  async function poll() {
    try {
      const guichets = await getGuichets();
      if (!cancelled) cb(guichets);
    } catch {
      // Session expirée ou serveur indisponible ; on retentera au prochain tick.
    }
  }
  poll();
  const id = setInterval(poll, POLL_INTERVAL_MS);
  return () => {
    cancelled = true;
    clearInterval(id);
  };
}

export const TICKET_STATUS_ACTIVE: ApiTicketStatus[] = ["CALLED", "IN_PROGRESS"];
