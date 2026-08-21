import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAgencies } from "../api/client";
import type { Agency } from "../types/ticket";

interface CurrentAgencyState {
  agency: Agency | null;
  agencies: Agency[];
  isLoading: boolean;
}

// Chaque borne/écran/poste agent est physiquement installé dans UNE agence.
// En attendant un vrai système de config/auth, on le détermine via
// ?agency=<id> dans l'URL (ex: /kiosk?agency=douala-centre), avec repli sur
// la première agence si le paramètre est absent ou invalide.
export function useCurrentAgency(): CurrentAgencyState {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CurrentAgencyState>({ agency: null, agencies: [], isLoading: true });

  useEffect(() => {
    let cancelled = false;
    getAgencies().then((agencies) => {
      if (cancelled) return;
      const requestedId = searchParams.get("agency");
      const agency = agencies.find((a) => a.id === requestedId) ?? agencies[0] ?? null;
      setState({ agency, agencies, isLoading: false });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("agency")]);

  return state;
}
