export type TicketStatus = "waiting" | "called" | "served" | "cancelled";
export type TicketPriority = "normal" | "high";
export type PriorityReason = "none" | "pregnancy" | "elderly" | "disability" | "other";

export interface Agency {
  id: string;
  name: string;
  city: string;
}

export type IdType = "cni" | "passeport";
export type ClientStatus = "existing" | "new";
export type AccountType = "courant" | "epargne";

export interface DepotDetails {
  type: "depot";
  operationType: "depot" | "retrait";
  amount: number;
  targetAccountNumber?: string;
}

export interface CompteDetails {
  type: "compte";
  desiredAccountType: AccountType;
  initialDeposit?: number;
}

export interface CarteDetails {
  type: "carte";
  requestType: "nouvelle" | "renouvellement" | "opposition";
  cardType: "classique" | "premium";
}

export interface ConseilDetails {
  type: "conseil";
  subject: "pret_immobilier" | "pret_personnel" | "epargne" | "autre";
  amount?: number;
}

export type ServiceDetails = DepotDetails | CompteDetails | CarteDetails | ConseilDetails;

export interface ClientInfo {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  idType: IdType;
  idNumber: string;
  clientStatus: ClientStatus;
  accountNumber?: string;
  accountType: AccountType;
}

export interface Service {
  id: string;
  name: string;
  icon: string; // nom d'icône lucide-react
}

export interface Feedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  agencyId: string;
  agencyName: string;
  agencyCity: string;
  serviceId: string;
  serviceName: string;
  status: TicketStatus;
  priority: TicketPriority;
  priorityReason?: PriorityReason;
  position: number;
  estimatedWaitMinutes: number;
  counterId: string | null;
  createdAt: string;
  clientInfo?: ClientInfo;
  serviceDetails?: ServiceDetails;
  feedback?: Feedback;
}

export interface Counter {
  id: string;
  label: string;
  agencyId: string;
  serviceId: string;
  currentTicketNumber: string | null;
}

export interface QueueSnapshot {
  counters: Counter[];
  upcoming: Ticket[];
  waiting: Ticket[];
  activeByCounter: Record<string, Ticket | null>;
}
