import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { getServices, createTicket, subscribeToTicketByCode } from "../../api/client";
import { LanguageProvider, useLanguage } from "../../i18n/LanguageContext";
import { ServiceButton } from "./ServiceButton";
import { ClientInfoForm } from "./ClientInfoForm";
import { TicketConfirmation } from "./TicketConfirmation";
import { LanguageToggle } from "./LanguageToggle";
import type { ApiService, ApiTicket } from "../../types/api";
import type { PriorityReason } from "../../types/api-extra";

type Step = "select-service" | "form" | "confirmation";

function KioskContent() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ApiService[]>([]);
  const [step, setStep] = useState<Step>("select-service");
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [priorityReason, setPriorityReason] = useState<PriorityReason>("none");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Une fois le ticket créé, on suit sa position en direct (elle évolue au
  // fur et à mesure que d'autres clients du même guichet sont traités).
  const [liveTicket, setLiveTicket] = useState<ApiTicket | null>(null);
  useEffect(() => {
    if (step !== "confirmation" || !ticket) return;
    return subscribeToTicketByCode(ticket.ticket_code, (t) => {
      if (t) setLiveTicket(t);
    });
  }, [step, ticket]);
  const displayedTicket = liveTicket ?? ticket;

  useEffect(() => {
    getServices().then(setServices).catch(() => setError("Impossible de charger les services."));
  }, []);

  function handleSelectService(service: ApiService) {
    setSelectedService(service);
    setStep("form");
  }

  async function handleFormSubmit(payload: {
    client_name: string;
    client_phone_number: number;
    client_email: string;
    numero_carte_credit?: number;
    priorityReason: PriorityReason;
    note: string;
  }) {
    if (!selectedService) return;
    setIsCreating(true);
    setError(null);
    try {
      const created = await createTicket({
        service: selectedService.id,
        client_name: payload.client_name,
        client_phone_number: payload.client_phone_number,
        client_email: payload.client_email,
        numero_carte_credit: payload.numero_carte_credit,
      });
      setTicket(created);
      setLiveTicket(null);
      setPriorityReason(payload.priorityReason);
      setStep("confirmation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le ticket. Réessayez.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleNewTicket() {
    setTicket(null);
    setLiveTicket(null);
    setSelectedService(null);
    setPriorityReason("none");
    setStep("select-service");
  }

  const headerSubtitle =
    step === "select-service"
      ? t.kiosk.subtitleSelect
      : step === "form"
      ? t.kiosk.subtitleForm
      : t.kiosk.subtitleConfirmation;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-10">
      <LanguageToggle />

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
          <Building2 size={24} className="text-accent" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-medium text-text">{t.kiosk.welcome}</p>
          <p className="text-sm text-text-muted">{headerSubtitle}</p>
        </div>
      </div>

      {error && (
        <p className="mb-4 max-w-md text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {step === "select-service" && (
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
          {services
            .filter((s) => s.is_active)
            .map((service) => (
              <ServiceButton key={service.id} service={service} onSelect={handleSelectService} />
            ))}
        </div>
      )}

      {step === "form" && selectedService && (
        <ClientInfoForm
          service={selectedService}
          onBack={() => setStep("select-service")}
          onSubmit={handleFormSubmit}
          isSubmitting={isCreating}
        />
      )}

      {step === "confirmation" && displayedTicket && (
        <TicketConfirmation
          ticket={displayedTicket}
          priorityReason={priorityReason}
          onNewTicket={handleNewTicket}
        />
      )}
    </div>
  );
}

export function Kiosk() {
  return (
    <LanguageProvider>
      <KioskContent />
    </LanguageProvider>
  );
}
