interface Props {
    size?: number;
    className?: string;
}

export function Logo({ size = 24, className }: Props) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 106"
            fill="none"
            aria-hidden="true"
            className={className}
        >
            {/* Logo content */}
            <rect x="0" y="16" width="120" height="90" rx="10" fill="currentColor" />
            <circle cx="60" cy="16" r="15" fill="var(--color-accent-soft)" />
            <line x1="60" y1="16" x2="60" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="16" x2="67" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="22" cy="83" r="4" fill="white" opacity="0.5" />
            <circle cx="42" cy="75" r="5" fill="white" opacity="0.75" />
            <circle cx="63" cy="65" r="6" fill="white" />
            <path d="M75 61 L84 70 L102 47"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}