import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Kiosk } from "../src/pages/Kiosk/Kiosk";

const SERVICES = [
  { id: 1, service_type: "DEPOT", service_description: "Dépôt", is_active: true, code_service: "D", priorite: "NORMALE", duree_estimee: null },
  { id: 2, service_type: "RETRAIT", service_description: "Retrait", is_active: true, code_service: "R", priorite: "NORMALE", duree_estimee: null },
];

const TICKET = {
  id_ticket: 13,
  ticket_code: "D013",
  ticket_status: "WAITING",
  service: SERVICES[0],
  guichet: { id: 1, guichet_name: "Guichet 1", guichet_description: "", guichet_status: "OPEN", services: [1] },
  owner: { id_client: 1, client_name: "Jean Mballa", client_phone_number: 690000000, client_email: "jean@test.com", login_date: new Date().toISOString(), carte_masquee: null },
  called_by: null,
  created_at: new Date().toISOString(),
  called_at: null,
  finished_at: null,
  queue_position: 1,
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/services/") && (!options || options.method === undefined)) {
        return new Response(JSON.stringify(SERVICES), { status: 200 });
      }
      if (url.endsWith("/tickets/create/") && options?.method === "POST") {
        return new Response(JSON.stringify(TICKET), { status: 201 });
      }
      if (url.includes("/tickets/status/") && (!options || options.method === undefined)) {
        return new Response(JSON.stringify(TICKET), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Kiosk - parcours complet (backend Django réel, simulé)", () => {
  it("affiche la confirmation et NE revient PAS à la sélection de service", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/kiosk"]}>
          <Kiosk />
        </MemoryRouter>
      </StrictMode>,
    );

    // 1. Sélection du service
    const serviceButton = await screen.findByText("Dépôt");
    await user.click(serviceButton);

    // 2. Remplissage du formulaire (champs réellement acceptés par l'API)
    await user.type(screen.getByLabelText("Nom complet"), "Jean Mballa");
    await user.type(screen.getByLabelText("Téléphone"), "690000000");
    await user.type(screen.getByLabelText("Email"), "jean@test.com");

    await user.click(screen.getByRole("button", { name: /Obtenir mon ticket/i }));

    // 3. La confirmation doit apparaître et rester affichée
    const ticketCodeEl = await screen.findByText("D013", {}, { timeout: 5000 });
    expect(ticketCodeEl).toBeInTheDocument();

    consoleErrorSpy.mock.calls.forEach((call) => console.log(call));

    await new Promise((r) => setTimeout(r, 1500));

    expect(screen.getByText("D013")).toBeInTheDocument();
    expect(screen.queryByText("Retrait")).not.toBeInTheDocument();
  });
});
