export interface YieldResult {
    month: number;
    year: number;
    scenarios: {
        mattress: { nominal: number; real: number };
        savings: { nominal: number; real: number };
        selic: { nominal: number; real: number };
        smart: { nominal: number; real: number };
    };
}

export interface YieldSummary {
    data: YieldResult[];
    final: {
        mattress: { nominal: number; real: number };
        savings: { nominal: number; real: number };
        selic: { nominal: number; real: number };
        smart: { nominal: number; real: number };
    };
    wealthGap: number; // Difference between Smart (Real) and Savings (Real)
    opportunityCost: number; // Factor of improvement (e.g. 2.5x)
}

const RATES = {
    mattress: 0,
    savings: 0.005, // 0.5% am
    selic: 0.0083, // 0.83% am
    smart: 0.012, // 1.2% am
    inflation: 0.00367, // ~4.5% pa derived constant for projection (1.045^(1/12) - 1)
};

export const calculateYieldProjection = ({
    initialAmount,
    monthlyContribution,
    years,
}: {
    initialAmount: number;
    monthlyContribution: number;
    years: number;
}): YieldSummary => {
    const totalMonths = years * 12;
    const data: YieldResult[] = [];

    let balances = {
        mattress: initialAmount,
        savings: initialAmount,
        selic: initialAmount,
        smart: initialAmount,
    };

    // We accumulate inflation factor relative to start date (1.0 = no inflation)
    // Real Value = Nominal / CumulativeInflation
    let cumulativeInflation = 1.0;

    // Initial Point (Month 0)
    data.push({
        month: 0,
        year: 0,
        scenarios: {
            mattress: { nominal: balances.mattress, real: balances.mattress },
            savings: { nominal: balances.savings, real: balances.savings },
            selic: { nominal: balances.selic, real: balances.selic },
            smart: { nominal: balances.smart, real: balances.smart },
        },
    });

    for (let month = 1; month <= totalMonths; month++) {
        // 1. Apply Contributions & Yield to Nominal Balances

        // Mattress: Just add contribution, no yield
        balances.mattress += monthlyContribution;

        // Others: Apply yield first, then add contribution (end of period)
        // Formula: Balance = Balance * (1 + rate) + Contribution
        balances.savings = balances.savings * (1 + RATES.savings) + monthlyContribution;
        balances.selic = balances.selic * (1 + RATES.selic) + monthlyContribution;
        balances.smart = balances.smart * (1 + RATES.smart) + monthlyContribution;

        // 2. Update Inflation Factor
        cumulativeInflation = cumulativeInflation * (1 + RATES.inflation);

        // 3. Store Data Points (Yearly + End)
        if (month % 12 === 0 || month === totalMonths) {
            data.push({
                month,
                year: month / 12,
                scenarios: {
                    mattress: {
                        nominal: balances.mattress,
                        real: balances.mattress / cumulativeInflation,
                    },
                    savings: {
                        nominal: balances.savings,
                        real: balances.savings / cumulativeInflation,
                    },
                    selic: {
                        nominal: balances.selic,
                        real: balances.selic / cumulativeInflation,
                    },
                    smart: {
                        nominal: balances.smart,
                        real: balances.smart / cumulativeInflation,
                    },
                },
            });
        }
    }

    const final = data[data.length - 1].scenarios;
    const wealthGap = final.smart.real - final.savings.real;
    const opportunityCost = final.savings.real > 0 ? final.smart.real / final.savings.real : 0;

    return {
        data,
        final,
        wealthGap,
        opportunityCost,
    };
};

export const formatCompact = (val: number) =>
    new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(val);

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
