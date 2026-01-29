import { useState, useEffect } from 'react';
import { PiggyBank, TrendingDown, Wallet } from 'lucide-react';
import { calculateProjection, formatCurrency } from '../lib/inflation-math';
import { ResultsCard } from '../components/ResultsCard';
import { InflationChart } from '../components/InflationChart';

export default function InflationSimulator() {
    const [initialAmount, setInitialAmount] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(1000);
    const [years, setYears] = useState(10);

    const [results, setResults] = useState(calculateProjection({
        initialAmount,
        monthlyContribution,
        years
    }));

    useEffect(() => {
        setResults(calculateProjection({
            initialAmount,
            monthlyContribution,
            years
        }));
    }, [initialAmount, monthlyContribution, years]);

    // Savings projection (approximate linear for display, or simple calculation)
    // Logic from requirements: "Card 02... Projected at ~6.17% p.a. / 0.5% monthly"
    // Wait, the "Nominal" (Card 1) is just sum of cash flows? 
    // "Card 01: Dinheiro Parado (Nominal) - 'Valor Nominal Acumulado' (Total of contributions)"
    // -> This usually means Initial + (Monthly * Months). No interest.
    // "Card 02: Rendimento na Poupança - 'Saldo na Poupança' (Projected ...)" -> This has yield.
    // "Card 03: Poder de Compra Real" -> Nominal / Inflation.

    // Re-reading requirements carefully:
    // Card 01: "Valor Nominal Acumulado" (Total of contributions). Warning: "Sem qualquer rendimento ou proteção."
    // -> This implies simple arithmetic sum: Initial + (Monthly * 12 * Years).

    // My math lib `calculateProjection` does:
    // Nominal Growth: Apply monthly yield + contribution.
    // -> This matches Card 02 (Savings).

    // I need to calculate:
    // 1. Stagnant Cash (Mattress): Initial + (Monthly * Months).
    // 2. Savings Balance (Yield): The `nominalValue` from my lib functions with `savingsRate`.
    // 3. Real Power: The `realValue` from my lib.

    // Ad-hoc correction: The Chart needs "Line A (Gold): Nominal".
    // Usually in these charts:
    // Line A is the Savings Balance (Accumulated Capital).
    // Line B is the Real Value (What that capital buys).
    // Card 01 says "Dinheiro Parado" (Mattress).
    // Card 02 says "Rendimento na Poupança" (Savings).

    // Wait, if Line A is "Nominal accumulation", does it refer to Savings or Mattress?
    // "Line A (Gold): Nominal accumulation."
    // "Line B (Grey/Dashed): Real Purchasing Power".
    // "Area between them: Highlighted as 'A Erosão do seu Patrimônio'".

    // Use Case:
    // User invests in Savings.
    // They see the number go up (Nominal).
    // But inflation eats it.
    // So Line A = Savings Balance.
    // Line B = Real Value of that Savings Balance.
    // The gap is the illusion (Erosion).

    // OK, so:
    // Card 1 (Mattress): Just inputs summed?
    // Actually, Card 1 says "Dinheiro Parado (Nominal) ... Total of contributions".
    // This is confusing. "Dinheiro Parado" usually implies "under mattress".
    // But "Nominal Accumulation" in the context of the chart (Line A) usually matches the Account Balance.
    // And "Real Purchasing Power" matches Line B.

    // I will interpret:
    // Card 1: Total Invested (Principal). (Initial + Monthly * Months). "Dinheiro Investido".
    // BUT the prompt says "Card 01: Dinheiro Parado...". Maybe implies "If you just left it there".
    // Card 2: Savings Result (Account Balance).
    // Card 3: Real Value.

    // Let's refine based on "The experience must be visceral... keeping money in a standard savings account... is a guaranteed loss".
    // So the comparison is likely:
    // Scenario A: Savings Account.
    // Result: Balance goes up. (Nominal)
    // Reality: Value goes down or grows slower than expected. (Real)

    // So:
    // Line A: Savings Balance.
    // Line B: Real Value.

    // Card 1: Total Contributions (Principal). ("This is what you put in").
    // Card 2: Final Balance (Nominal). ("This is what the bank shows").
    // Card 3: Real Value. ("This is what it's worth").

    // Wait, prompt says: "Card 01: Dinheiro Parado (Nominal) - Text 'Valor Nominal Acumulado' (Total of contributions)."
    // So Card 1 = Principal.

    const totalPrincipal = initialAmount + (monthlyContribution * 12 * years);
    const savingsBalance = results.finalNominal;
    const realValue = results.finalReal;

    return (
        <div className="min-h-screen bg-background px-4 py-8 text-secondary md:pb-12 md:pt-12">
            <div className="mx-auto max-w-6xl space-y-12">

                {/* Header */}
                <header className="space-y-4 text-center">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-secondary md:text-5xl lg:text-6xl">
                        A Destruição Silenciosa
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-secondary/70 font-sans">
                        Descubra como a inflação corrói o seu patrimônio enquanto ele parece crescer na poupança.
                    </p>
                </header>

                {/* Inputs Section */}
                <section className="grid gap-8 rounded-2xl border border-border/20 bg-white/40 p-6 backdrop-blur-sm md:grid-cols-3 md:p-8">

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wide text-secondary/60">Montante Inicial</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-secondary/40">R$</span>
                            <input
                                type="number"
                                value={initialAmount}
                                onChange={(e) => setInitialAmount(Number(e.target.value))}
                                className="w-full rounded-lg border border-border/30 bg-white/60 py-3 pl-12 pr-4 font-serif text-xl font-bold text-secondary shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wide text-secondary/60">Aporte Mensal</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-secondary/40">R$</span>
                            <input
                                type="number"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                className="w-full rounded-lg border border-border/30 bg-white/60 py-3 pl-12 pr-4 font-serif text-xl font-bold text-secondary shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wide text-secondary/60">Horizonte (Anos): {years}</label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border/20 accent-primary"
                        />
                        <div className="flex justify-between text-xs text-secondary/40 font-sans">
                            <span>1 ano</span>
                            <span>25 anos</span>
                            <span>50 anos</span>
                        </div>
                    </div>
                </section>

                {/* Results Cards */}
                <section className="grid gap-6 md:grid-cols-3">
                    <ResultsCard
                        label="Valor Nominal Acumulado"
                        value={formatCurrency(totalPrincipal)}
                        subtext="Total aportado do seu bolso"
                        icon={Wallet}
                    />
                    <ResultsCard
                        label="Saldo na Poupança"
                        value={formatCurrency(savingsBalance)}
                        subtext="Projeção com rendimento de 0,5% a.m."
                        icon={PiggyBank}
                        className="border-primary/30 bg-primary/5"
                    />
                    <ResultsCard
                        label="Poder de Compra Real"
                        value={formatCurrency(realValue)}
                        subtext="Valor corrigido pela inflação (IPCA 4,5% a.a.)"
                        isWarning={realValue < totalPrincipal}
                        icon={TrendingDown}
                    />
                </section>

                {/* Chart Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif text-2xl font-bold text-secondary">A Erosão do Patrimônio</h2>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#D4AF37]"></span>
                                <span className="text-secondary/70">Nominal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                                <span className="text-secondary/70">Real (IPCA)</span>
                            </div>
                        </div>
                    </div>
                    <InflationChart data={results.data} />
                </section>

                {/* Footer info */}
                <footer className="text-center text-sm text-secondary/40 font-sans">
                    <p>Considerando IPCA fixo de 4,5% a.a. e rendimento da poupança de 0,5% a.m.</p>
                </footer>

            </div>
        </div>
    );
}
