

export function IconMenu({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
export function IconFilter({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
export function IconMore({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="6" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="18" cy="12" r="1.6" fill="currentColor" />
        </svg>
    );
}
export function IconChat({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5A3.5 3.5 0 0 1 16.5 15H12l-4 4v-4H7.5A3.5 3.5 0 0 1 4 11.5v-5Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconFolder({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconHashtag({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 9h14M4 15h14M9 4L7 20M17 4l-2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
export function IconCaptain({ className = "h-4 w-4" }) { // 占位
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconUsers({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M16 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM2 20a7 7 0 0 1 14 0M8 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconChart({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 19h16M7 16V8m5 8v-6m5 6V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
export function IconCalendar({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M7 3v3m10-3v3M3 9h18M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconBook({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
export function IconSettings({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-1.4 3.4h-1.1a1 1 0 0 0-.9.6l-.4 1a2 2 0 0 1-3.8 0l-.4-1a1 1 0 0 0-.9-.6H8.4A2 2 0 0 1 7 19.6l.1-.1A1 1 0 0 0 7.3 18l-1-1.7a2 2 0 0 1 0-2l1-1.7a1 1 0 0 0-.2-1.1l-.1-.1A2 2 0 0 1 8.4 7h1.1a1 1 0 0 0 .9-.6l.4-1a2 2 0 0 1 3.8 0l.4 1a1 1 0 0 0 .9.6h1.1A2 2 0 0 1 20 8.4l-.1.1a1 1 0 0 0-.2 1.1l1 1.7a2 2 0 0 1 0 2l-1 1.7Z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}


export function IconX({ className = 'h-4 w-4' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

