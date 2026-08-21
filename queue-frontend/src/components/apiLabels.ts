import type { ApiTicketStatus, GuichetStatus, ServiceType } from "../types/api";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  DEPOT: "Dépôt",
  RETRAIT: "Retrait",
  ASSISTANCE: "Assistance",
  CREATION_COMPTE: "Ouverture de compte",
  SERVICE_CLIENT: "Service client",
};

export const GUICHET_STATUS_LABELS: Record<GuichetStatus, string> = {
  OPEN: "Ouvert",
  BUSY: "Occupé",
  CLOSED: "Fermé",
  REPAIRING: "Maintenance",
};

export const TICKET_STATUS_LABELS: Record<ApiTicketStatus, string> = {
  WAITING: "En attente",
  CALLED: "Appelé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABSENT: "Absent",
  TRANSFERRED: "Transféré",
  CANCELLED: "Annulé",
};
