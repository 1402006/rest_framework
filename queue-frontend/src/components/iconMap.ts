import { Banknote, Wallet, LifeBuoy, FileText, Users, type LucideIcon } from "lucide-react";
import type { ServiceType } from "../types/api";

export const SERVICE_TYPE_ICONS: Record<ServiceType, LucideIcon> = {
  DEPOT: Banknote,
  RETRAIT: Wallet,
  ASSISTANCE: LifeBuoy,
  CREATION_COMPTE: FileText,
  SERVICE_CLIENT: Users,
};
