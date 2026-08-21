// Types "frontend only" : fonctionnalités que nous avons construites côté
// interface mais que l'API Django actuelle ne sait pas encore persister
// (pas de champ/endpoint prévu). Conservés pour l'expérience utilisateur et
// pour ne rien perdre le jour où le backend les supportera.

export type PriorityReason = "none" | "pregnancy" | "elderly" | "disability" | "other";

export interface LocalFeedback {
  rating: number;
  comment?: string;
}
