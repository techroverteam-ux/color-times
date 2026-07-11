export function AdminFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-2 border-t border-border px-4 py-4 pb-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:pb-4">
      <p>&copy; {new Date().getFullYear()} Color Times Boutique. All rights reserved.</p>
      <a
        href="https://techrover.in"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 transition-colors hover:text-foreground"
      >
        <span>Developed by</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <rect x="1" y="1" width="22" height="22" rx="6" fill="currentColor" className="text-primary" />
          <path
            d="M6.5 8.5h11M12 8.5v9M8.5 12.5c0 1.5 1.2 2.5 3.5 2.5"
            stroke="var(--card)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="font-medium">TechRover</span>
      </a>
    </footer>
  );
}
