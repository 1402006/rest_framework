import { useCallback, useEffect, useState } from "react";
import { Headset, LogOut, MapPin } from "lucide-react";
import { isLoggedIn, logout } from "../../api/auth";
import {
  authFetchTickets,
  callNextTicket,
  completeTicket,
  getCurrentAgent,
  getGuichets,
  markAbsentTicket,
  startTicket,
  transferTicket,
  updateMyStatus,
} from "../../api/client";
import { Login } from "./Login";
import { WaitingList } from "./WaitingList";
import { ActiveClientCard } from "./ActiveClientCard";
import type { ApiAgent, ApiGuichetDetail, ApiTicket } from "../../types/api";

const POLL_MS = 3000;

export function Agent() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [agent, setAgent] = useState<ApiAgent | null>(null);
  const [guichet, setGuichet] = useState<ApiGuichetDetail | null>(null);
  const [allGuichets, setAllGuichets] = useState<ApiGuichetDetail[]>([]);
  const [waiting, setWaiting] = useState<ApiTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<ApiTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const refresh = useCallback(async () => {
    const me = await getCurrentAgent();
    if (!me || !me.guichet) return;
    setAgent(me);

    const guichets = await getGuichets();
    setAllGuichets(guichets);
    const myGuichet = guichets.find((g) => g.id === me.guichet) ?? null;
    setGuichet(myGuichet);

    const tickets = await authFetchTickets({ guichet: me.guichet });
    setWaiting(tickets.filter((t) => t.ticket_status === "WAITING"));
    const mine = tickets.find(
      (t) =>
        (t.ticket_status === "CALLED" || t.ticket_status === "IN_PROGRESS") &&
        t.called_by?.id === me.id,
    );
    setActiveTicket(mine ?? null);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    setIsLoadingProfile(true);
    refresh()
      .then(() => updateMyStatus("AVAILABLE").catch(() => {}))
      .finally(() => setIsLoadingProfile(false));

    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [loggedIn, refresh]);

  async function runAction(action: () => Promise<unknown>) {
    setError(null);
    setIsBusy(true);
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setIsBusy(false);
    }
  }

  function handleLogout() {
    updateMyStatus("OFFLINE").catch(() => {});
    logout();
    setLoggedIn(false);
    setAgent(null);
    setGuichet(null);
    setActiveTicket(null);
  }

  if (!loggedIn) {
    return <Login onLoggedIn={() => setLoggedIn(true)} />;
  }

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-text-muted">Chargement du profil...</p>
      </div>
    );
  }

  if (!agent || !agent.guichet) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-text-muted">
          Votre compte n'est rattaché à aucun guichet. Contactez un administrateur.
        </p>
      </div>
    );
  }

  const otherGuichets = guichet
    ? allGuichets.filter(
        (g) => g.id !== guichet.id && g.services.some((s) => s.id === activeTicket?.service.id),
      )
    : [];

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10 sm:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
            <Headset size={22} className="text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-medium text-text">
              {guichet?.guichet_name ?? "Guichet"}
            </p>
            <p className="flex items-center gap-2 text-sm text-text-muted">
              {activeTicket ? "Occupé" : "Disponible"}
              <span className="flex items-center gap-1 text-xs">
                <MapPin size={11} aria-hidden="true" />
                {agent.username}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text"
        >
          <LogOut size={16} aria-hidden="true" />
          Se déconnecter
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {activeTicket ? (
        <ActiveClientCard
          ticket={activeTicket}
          otherGuichets={otherGuichets}
          disabled={isBusy}
          onStart={() => runAction(() => startTicket(activeTicket.id_ticket))}
          onComplete={() => runAction(() => completeTicket(activeTicket.id_ticket))}
          onAbsent={() => runAction(() => markAbsentTicket(activeTicket.id_ticket))}
          onTransfer={(guichetId) => runAction(() => transferTicket(activeTicket.id_ticket, guichetId))}
        />
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">
              Clients en attente ({waiting.length})
            </p>
            <button
              type="button"
              onClick={() => runAction(callNextTicket)}
              disabled={isBusy || waiting.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white
                         transition-colors hover:bg-accent-hover
                         disabled:pointer-events-none disabled:opacity-50"
            >
              Appeler le prochain
            </button>
          </div>
          <WaitingList tickets={waiting} />
        </div>
      )}
    </div>
  );
}
