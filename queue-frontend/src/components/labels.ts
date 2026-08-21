import type { AccountType, ClientStatus, IdType } from "../types/ticket";

export const ID_TYPE_LABELS: Record<IdType, string> = {
  cni: "Carte Nationale d'Identité",
  passeport: "Passeport",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  new: "Nouveau client",
  existing: "Client existant",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  courant: "Compte courant",
  epargne: "Compte épargne",
};

export const OPERATION_TYPE_LABELS: Record<"depot" | "retrait", string> = {
  depot: "Dépôt",
  retrait: "Retrait",
};

export const CARD_REQUEST_TYPE_LABELS: Record<"nouvelle" | "renouvellement" | "opposition", string> = {
  nouvelle: "Nouvelle carte",
  renouvellement: "Renouvellement",
  opposition: "Opposition / blocage",
};

export const CARD_TYPE_LABELS: Record<"classique" | "premium", string> = {
  classique: "Classique",
  premium: "Premium",
};

export const CONSEIL_SUBJECT_LABELS: Record<
  "pret_immobilier" | "pret_personnel" | "epargne" | "autre",
  string
> = {
  pret_immobilier: "Prêt immobilier",
  pret_personnel: "Prêt personnel",
  epargne: "Épargne",
  autre: "Autre",
};

export function formatAmount(value: number): string {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export const PRIORITY_REASON_LABELS: Record<"pregnancy" | "elderly" | "disability" | "other", string> = {
  pregnancy: "Femme enceinte",
  elderly: "Personne âgée",
  disability: "Personne en situation de handicap",
  other: "Autre urgence",
};
