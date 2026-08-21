import { Banknote, Landmark, CreditCard, Users } from "lucide-react";
import type { ServiceDetails } from "../../types/ticket";
import {
  ACCOUNT_TYPE_LABELS,
  OPERATION_TYPE_LABELS,
  CARD_REQUEST_TYPE_LABELS,
  CARD_TYPE_LABELS,
  CONSEIL_SUBJECT_LABELS,
  formatAmount,
} from "../../components/labels";

function Row({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 text-accent" aria-hidden="true" />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text">{value}</p>
      </div>
    </div>
  );
}

export function ServiceDetailsPanel({ details }: { details: ServiceDetails }) {
  switch (details.type) {
    case "depot":
      return (
        <>
          <Row icon={Banknote} label="Opération" value={OPERATION_TYPE_LABELS[details.operationType]} />
          <Row icon={Banknote} label="Montant" value={formatAmount(details.amount)} />
          {details.targetAccountNumber && (
            <Row icon={Landmark} label="Compte concerné" value={details.targetAccountNumber} />
          )}
        </>
      );
    case "compte":
      return (
        <>
          <Row icon={Landmark} label="Type de compte souhaité" value={ACCOUNT_TYPE_LABELS[details.desiredAccountType]} />
          {details.initialDeposit !== undefined && (
            <Row icon={Banknote} label="Dépôt initial" value={formatAmount(details.initialDeposit)} />
          )}
        </>
      );
    case "carte":
      return (
        <>
          <Row icon={CreditCard} label="Type de demande" value={CARD_REQUEST_TYPE_LABELS[details.requestType]} />
          <Row icon={CreditCard} label="Type de carte" value={CARD_TYPE_LABELS[details.cardType]} />
        </>
      );
    case "conseil":
      return (
        <>
          <Row icon={Users} label="Sujet" value={CONSEIL_SUBJECT_LABELS[details.subject]} />
          {details.amount !== undefined && (
            <Row icon={Banknote} label="Montant envisagé" value={formatAmount(details.amount)} />
          )}
        </>
      );
    default:
      return null;
  }
}
