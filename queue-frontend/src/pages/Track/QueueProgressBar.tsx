interface Props {
  position: number;
}

export function QueueProgressBar({ position }: Props) {
  const scale = 10;
  const progress = Math.max(0, Math.min(1, 1 - (position - 1) / scale));

  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-text-muted">
        {position <= 1 ? "Vous êtes le prochain" : `${position - 1} personne${position - 1 > 1 ? "s" : ""} avant vous`}
      </p>
    </div>
  );
}
