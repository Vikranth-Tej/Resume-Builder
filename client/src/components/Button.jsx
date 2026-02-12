export const Button = ({ children, onClick, className = '', type = 'button', variant = 'primary' }) => {
    const baseStyles = "px-4 py-2 font-bold uppercase tracking-widest text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 font-serif rounded-none border-2";

    const variants = {
        primary: "bg-[var(--news-ink)] text-[var(--news-paper)] border-[var(--news-ink)] hover:bg-[var(--news-accent)] hover:border-[var(--news-accent)] focus:ring-[var(--news-accent)]",
        secondary: "bg-[var(--news-paper)] text-[var(--news-ink)] border-[var(--news-border)] hover:bg-[var(--news-border)] focus:ring-[var(--news-border)]",
        outline: "bg-transparent text-[var(--news-ink)] border-[var(--news-ink)] hover:bg-[var(--news-border)] focus:ring-[var(--news-ink)]"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
