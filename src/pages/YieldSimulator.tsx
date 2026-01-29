import { useState, useMemo } from 'react';
import { PiggyBank, TrendingUp, Wallet, Activity } from 'lucide-react';
import { calculateYieldProjection, formatCurrency } from '../lib/yield-engine';
import { ComparisonCard } from '../components/ComparisonCard';
import { YieldChart } from '../components/YieldChart';

export default function YieldSimulator() {
    const [initialAmount, setInitialAmount] = useState(10000);
    const [years, setYears] = useState(10);
    const [showReal, setShowReal] = useState(false); // Toggle for Inflation Adjusted

    const results = useMemo(() => calculateYieldProjection({
        initialAmount,
        monthlyContribution: 0, // Hardcoded to 0 as feature was removed
        years
    }), [initialAmount, years]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] px-4 py-8 text-[#1A1A1A] md:pb-12 md:pt-12">
            <div className="mx-auto max-w-6xl space-y-12">

                {/* Header */}
                <header className="space-y-6 text-center">
                    <div className="space-y-4">
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl">
                            O Custo da Estagnação
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-[#1A1A1A]/60 font-sans">
                            Veja a diferença brutal entre a Poupança e uma Carteira Inteligente ao longo do tempo.
                        </p>
                    </div>
                </header>

                {/* Inputs Section */}
                <section className="grid gap-8 rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wide text-[#1A1A1A]/60">Montante Inicial</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#1A1A1A]/40">R$</span>
                            <input
                                type="number"
                                value={initialAmount}
                                onChange={(e) => setInitialAmount(Number(e.target.value))}
                                className="w-full rounded-lg border border-[#1A1A1A]/10 bg-[#FAFAFA] py-3 pl-12 pr-4 font-serif text-xl font-bold text-[#1A1A1A] shadow-sm transition-all focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50"
                            />
                        </div>
                    </div>



                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wide text-[#1A1A1A]/60">Horizonte (Anos): {years}</label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1A1A1A]/10 accent-[#D4AF37]"
                        />
                        <div className="flex justify-between text-xs text-[#1A1A1A]/40 font-sans">
                            <span>1 ano</span>
                            <span>50 anos</span>
                        </div>
                    </div>
                </section>

                {/* Wealth Gap Matrix (Cards) */}
                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Dark/Gold theme for cards to pop against light background? 
                        User prompt said "Glassmorphism with light transparency".
                        To make it readable on white bg, I'll use Dark Cards or Light Cards with strong borders.
                        Let's use Dark Cards for contrast as per visual guide "Premium White & Gold" usually mixes both.
                    */}

                    <ComparisonCard
                        title="Dinheiro Parado"
                        nominalValue={formatCurrency(results.final.mattress.nominal)}
                        realValue={formatCurrency(results.final.mattress.real)}
                        yieldRate="0% a.m."
                        icon={Wallet}
                        showReal={showReal}
                        subtext="Sem rendimento"
                    />
                    <ComparisonCard
                        title="Poupança"
                        nominalValue={formatCurrency(results.final.savings.nominal)}
                        realValue={formatCurrency(results.final.savings.real)}
                        yieldRate="0,50% a.m."
                        icon={PiggyBank}
                        showReal={showReal}
                        subtext="Perde para inflação real"
                    />
                    <ComparisonCard
                        title="Tesouro Selic"
                        nominalValue={formatCurrency(results.final.selic.nominal)}
                        realValue={formatCurrency(results.final.selic.real)}
                        yieldRate="0,83% a.m."
                        icon={Activity}
                        showReal={showReal}
                        subtext="Renda Fixa Conservadora"
                    />
                    <ComparisonCard
                        title="Carteira Inteligente"
                        nominalValue={formatCurrency(results.final.smart.nominal)}
                        realValue={formatCurrency(results.final.smart.real)}
                        yieldRate="1,20% a.m."
                        icon={TrendingUp}
                        isHighlight={true}
                        showReal={showReal}
                        subtext="Otimizada para crescimento"
                    />
                </section>

                {/* Controls & Chart */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Curva de Crescimento</h2>

                        <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm border border-[#1A1A1A]/5">
                            <span className={`text-sm font-medium ${!showReal ? 'text-[#D4AF37]' : 'text-[#1A1A1A]/40'}`}>Nominal</span>
                            <button
                                onClick={() => setShowReal(!showReal)}
                                className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${showReal ? 'bg-[#1A1A1A]' : 'bg-[#D4AF37]/50'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showReal ? 'translate-x-6' : 'translate-x-1'
                                        } mt-1 shadow-md`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${showReal ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}`}>Poder de Compra (Real)</span>
                        </div>
                    </div>

                    {/* Chart Container - Darker bg for contrast with the lines */}
                    <div className="overflow-hidden rounded-2xl bg-[#1A1A1A] p-1 shadow-xl">
                        <YieldChart data={results.data} showReal={showReal} />
                    </div>
                </section>

                {/* Opportunity Cost Highlight */}


            </div>
        </div>
    );
}
