import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { SimulationResult } from '../lib/inflation-math';

interface InflationChartProps {
    data: SimulationResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border/50 bg-white/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 font-serif text-sm font-bold text-secondary">Ano {label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium text-secondary/70">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-secondary">
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

export function InflationChart({ data }: InflationChartProps) {
    return (
        <div className="h-[400px] w-full rounded-2xl border border-border/30 bg-white/40 p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
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

                    <Area
                        type="monotone"
                        dataKey="nominalValue"
                        name="Valor Nominal"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        fill="url(#colorNominal)"
                    />
                    <Area
                        type="monotone"
                        dataKey="realValue"
                        name="Poder de Compra Real"
                        stroke="#6B7280"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#colorReal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
