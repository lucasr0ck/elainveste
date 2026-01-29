import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from 'recharts';
import type { YieldResult } from '../lib/yield-engine';

interface YieldChartProps {
    data: YieldResult[];
    showReal: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-[#D4AF37]/20 bg-[#1A1A1A]/95 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 font-serif text-sm font-bold text-[#D4AF37]">Ano {label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium text-white/70">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-white">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    maximumFractionDigits: 0
                                }).format(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function YieldChart({ data, showReal }: YieldChartProps) {
    // Transform nested data for Recharts structure
    const chartData = data.map(item => ({
        year: item.year,
        mattress: showReal ? item.scenarios.mattress.real : item.scenarios.mattress.nominal,
        savings: showReal ? item.scenarios.savings.real : item.scenarios.savings.nominal,
        selic: showReal ? item.scenarios.selic.real : item.scenarios.selic.nominal,
        smart: showReal ? item.scenarios.smart.real : item.scenarios.smart.nominal,
    }));

    return (
        <div className="h-[400px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorSmart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('pt-BR', {
                                notation: "compact",
                                compactDisplay: "short"
                            }).format(value)
                        }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />

                    {/* Mattress (Grey) - Baseline */}
                    <Area
                        type="monotone"
                        dataKey="mattress"
                        name="Dinheiro Parado"
                        stroke="#6B7280"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="transparent"
                        dot={false}
                    />

                    {/* Savings (Orange) */}
                    <Area
                        type="monotone"
                        dataKey="savings"
                        name="Poupança"
                        stroke="#F97316"
                        strokeWidth={2}
                        fill="transparent"
                        dot={false}
                    />

                    {/* Selic (Yellow) */}
                    <Area
                        type="monotone"
                        dataKey="selic"
                        name="Tesouro Selic"
                        stroke="#EAB308"
                        strokeWidth={2}
                        fill="transparent"
                        dot={false}
                    />

                    {/* Smart Portfolio (Emerald/Green) - The Solution */}
                    <Area
                        type="monotone"
                        dataKey="smart"
                        name="Carteira Inteligente"
                        stroke="#10B981"
                        strokeWidth={3}
                        fill="url(#colorSmart)"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
