import { useState, type FormEvent } from "react";
import { Headset, LogIn } from "lucide-react";
import { login } from "../../api/auth";

interface Props {
  onLoggedIn: () => void;
}

export function Login({ onLoggedIn }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      onLoggedIn();
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
            <Headset size={24} className="text-accent" aria-hidden="true" />
          </div>
          <p className="text-lg font-medium text-text">Connexion agent</p>
        </div>

        <div className="mb-4 flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium text-text">
            Identifiant
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                       outline-none focus:border-accent"
            autoComplete="username"
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-text">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                       outline-none focus:border-accent"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent
                     px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover
                     disabled:pointer-events-none disabled:opacity-60"
        >
          <LogIn size={16} aria-hidden="true" />
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
