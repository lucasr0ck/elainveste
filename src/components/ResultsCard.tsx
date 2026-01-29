import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultsCardProps {
    label: string;
    value: string;
    subtext?: string;
    isWarning?: boolean;
    icon?: LucideIcon;
    className?: string;
}

export function ResultsCard({
    label,
    value,
    subtext,
    isWarning = false,
    icon: Icon,
    className
}: ResultsCardProps) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-border/40 bg-white/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
            className
        )}>
            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="font-sans text-sm font-medium uppercase tracking-wider text-secondary/60">
                        {label}
                    </span>
                    {Icon && <Icon className="h-5 w-5 text-primary opacity-80" />}
                </div>

                <div className="flex items-baseline gap-2">
                    <span className={`font-serif text-3xl font-bold tracking-tight ${isWarning ? 'text-red-500/90' : 'text-secondary'}`}>
                        {value}
                    </span>
                </div>

                {subtext && (
                    <p className="font-sans text-xs text-secondary/50">
                        {subtext}
                    </p>
                )}
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />

            {/* Gold Glow effect on hover (handled by parent class or utility usually, but simple here) */}
        </div>
    );
}
