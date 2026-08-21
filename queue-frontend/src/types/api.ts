// Types reflétant EXACTEMENT les serializers du backend Django
// (rest_framework-backend_stable). Toute divergence avec api/views.py ou
// api/serializers.py côté backend doit être répercutée ici.

export type ServiceType =
  | "DEPOT"
  | "RETRAIT"
  | "ASSISTANCE"
  | "CREATION_COMPTE"
  | "SERVICE_CLIENT";

export type ServicePriority = "HAUTE" | "BASSE" | "NORMALE";

export interface ApiService {
  id: number;
  service_type: ServiceType;
  service_description: string;
  is_active: boolean;
  code_service: string | null;
  priorite: ServicePriority | null;
  duree_estimee: string | null;
}

export type GuichetStatus = "OPEN" | "BUSY" | "CLOSED" | "REPAIRING";

// Tel que renvoyé par GET /guichets/ et /guichets/<pk>/ (GuichetDetailSerializer).
export interface ApiGuichetDetail {
  id: number;
  guichet_name: string;
  guichet_description: string;
  guichet_status: GuichetStatus;
  services: ApiService[];
  waiting_count: number;
}

// Tel qu'imbriqué dans un ticket (GuichetSerializer — services = ids bruts).
export interface ApiGuichetRef {
  id: number;
  guichet_name: string;
  guichet_description: string;
  guichet_status: GuichetStatus;
  services: number[];
}

export interface ApiClient {
  id_client: number;
  client_name: string;
  client_phone_number: number;
  client_email: string;
  login_date: string;
  carte_masquee: string | null;
}

export type AgentRole = "ADMIN" | "AGENT";
export type AgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface ApiAgent {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: number;
  born_date: string | null;
  role: AgentRole | null;
  agent_status: AgentStatus;
  guichet: number | null;
  is_active: boolean;
}

export type ApiTicketStatus =
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABSENT"
  | "TRANSFERRED"
  | "CANCELLED";

export interface ApiTicket {
  id_ticket: number;
  ticket_code: string;
  ticket_status: ApiTicketStatus;
  service: ApiService;
  guichet: ApiGuichetRef;
  owner: ApiClient;
  called_by: ApiAgent | null;
  created_at: string;
  called_at: string | null;
  finished_at: string | null;
  queue_position: number;
}

export interface CreateTicketPayload {
  service: number;
  guichet?: number;
  client_name: string;
  client_phone_number: number;
  client_email: string;
  numero_carte_credit?: number;
}
