import type { LucideIcon } from 'lucide-react';
// Wait, I haven't seen lib/utils. I should check if it exists or use template literals.
// I'll stick to template literals/standard className for safety based on previous files.

interface ComparisonCardProps {
    title: string;
    nominalValue: string;
    realValue: string;
    yieldRate: string;
    icon: LucideIcon;
    isHighlight?: boolean;
    showReal?: boolean;
    subtext?: string;
}

export function ComparisonCard({
    title,
    nominalValue,
    realValue,
    yieldRate,
    icon: Icon,
    isHighlight = false,
    showReal = false,
    subtext
}: ComparisonCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${isHighlight
            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)]'
            : 'border-[#1A1A1A]/10 bg-white hover:border-[#1A1A1A]/20'
            }`}>
            {isHighlight && (
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#D4AF37]/20 blur-2xl animate-pulse" />
            )}

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`rounded-full p-2 ${isHighlight ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/70'}`}>
                        <Icon size={24} />
                    </div>
                    <span className={`text-xs font-medium uppercase tracking-wider ${isHighlight ? 'text-[#D4AF37]' : 'text-[#1A1A1A]/40'}`}>
                        {yieldRate}
                    </span>
                </div>

                <div>
                    <h3 className={`text-sm font-medium ${isHighlight ? 'text-[#D4AF37]/90' : 'text-[#1A1A1A]/60'}`}>{title}</h3>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-2xl font-bold font-serif md:text-3xl ${isHighlight ? 'text-[#D4AF37]' : 'text-[#1A1A1A]'}`}>
                            {showReal ? realValue : nominalValue}
                        </span>
                    </div>
                    {showReal && (
                        <p className={`mt-1 text-xs ${isHighlight ? 'text-[#D4AF37]/70' : 'text-[#1A1A1A]/40'}`}>Poder de compra real</p>
                    )}
                    {!showReal && subtext && (
                        <p className={`mt-1 text-xs ${isHighlight ? 'text-[#D4AF37]/70' : 'text-[#1A1A1A]/40'}`}>{subtext}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
