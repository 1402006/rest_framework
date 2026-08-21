import { MonitorOff } from "lucide-react";

// Écran mis de côté volontairement : dans l'état actuel de l'API Django,
// il n'existe pas d'endpoint public pour afficher la file en direct
// (GET /guichets/ et GET /tickets/ exigent tous deux un agent connecté),
// et Display est un écran public sans personne pour se connecter.
// À reprendre une fois qu'une solution aura été choisie côté backend
// (compte technique dédié, ou endpoint public en lecture seule).
export function Display() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <MonitorOff size={32} className="text-text-muted" aria-hidden="true" />
      <p className="text-sm text-text-muted">
        Écran d'affichage temporairement indisponible — en attente d'un accès public côté API.
      </p>
    </div>
  );
}
