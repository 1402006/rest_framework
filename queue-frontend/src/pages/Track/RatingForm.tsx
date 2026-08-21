import { useState } from "react";
import { Star, Send } from "lucide-react";
import type { LocalFeedback } from "../../types/api-extra";

interface Props {
  onSubmitted: (feedback: LocalFeedback) => void;
}

// Pas d'endpoint de notation côté API Django actuelle : on garde l'avis en
// local le temps de l'affichage (voir types/api-extra.ts). Rien n'est envoyé
// au serveur pour l'instant.
export function RatingForm({ onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  function handleSubmit() {
    if (rating === 0) return;
    onSubmitted({ rating, comment: comment.trim() || undefined });
  }

  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-text">
        Comment s'est passée votre prise en charge ?
      </p>
      <div className="mb-3 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
          >
            <Star
              size={26}
              className={
                value <= (hovered || rating)
                  ? "fill-warning text-warning"
                  : "text-border"
              }
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Un commentaire (facultatif)"
        rows={2}
        className="mb-3 w-full rounded-lg border border-border bg-surface-raised
                   px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent
                   px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover
                   disabled:pointer-events-none disabled:opacity-50"
      >
        <Send size={14} aria-hidden="true" />
        Envoyer mon avis
      </button>
    </div>
  );
}
