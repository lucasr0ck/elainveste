export interface SimulationParams {
    initialAmount: number;
    monthlyContribution?: number; // Optional/Deprecated
    years: number;
    inflationRate?: number; // Annual inflation rate (default 0.045 = 4.5%)
    savingsRate?: number;   // Monthly savings return (default 0.005 = 0.5%)
}

export interface SimulationResult {
    year: number;
    nominalValue: number;
    realValue: number;
}

export const calculateProjection = ({
    initialAmount,
    years,
    inflationRate = 0.045,
    savingsRate = 0.005,
}: Omit<SimulationParams, 'monthlyContribution'>): { data: SimulationResult[]; finalNominal: number; finalReal: number } => {
    const data: SimulationResult[] = [];
    let currentNominal = initialAmount;

    // Calculate monthly inflation rate from annual rate: (1 + annual)^(1/12) - 1
    const monthlyInflation = Math.pow(1 + inflationRate, 1 / 12) - 1;

    // Add initial point
    data.push({
        year: 0,
        nominalValue: initialAmount,
        realValue: initialAmount,
    });

    for (let month = 1; month <= years * 12; month++) {
        // Nominal Growth: Apply monthly yield
        currentNominal = currentNominal * (1 + savingsRate);

        // We only store yearly data points for the chart to keep it clean
        if (month % 12 === 0) {
            const year = month / 12;

            // Real Value Calculation: Fisher Equation logic
            // Real = Nominal / (1 + inflation)^years
            // Using precise monthly compounding for inflation match
            const inflationFactor = Math.pow(1 + monthlyInflation, month);
            const realValue = currentNominal / inflationFactor;

            data.push({
                year,
                nominalValue: Math.round(currentNominal),
                realValue: Math.round(realValue),
            });
        }
    }

    const lastPoint = data[data.length - 1];
    return {
        data,
        finalNominal: lastPoint.nominalValue,
        finalReal: lastPoint.realValue,
    };
};

// Historical Data Interface
import ipcaHistory from '../data/ipca-history.json';

// We assume the JSON is sorted, but let's be safe if we were really robust. 
// For this MVP, we rely on generate_ipca.py output (2010-01 to 2025-12).

export const calculateRealHistoricalErosion = ({
    initialAmount,
    years,
    savingsRate = 0.0035, // TUNED: 0.35% monthly to reflect "Real Loss" reality (approx 70% of Period CDI average)
}: Omit<SimulationParams, 'inflationRate' | 'monthlyContribution'>) => {

    // 1. Determine Window
    // We want the LAST N years of available data.
    // Available data ends in 2025-12.
    // Start Date = End Date - (Years * 12 months)

    const totalMonths = years * 12;
    const historyLength = ipcaHistory.length;

    // Guard: If requested years > available history (16 years), strictly cap or mock?
    // User asked for 10 years default. Data is 16 years.
    // If user asks for 20 years, we only have 16. We'll use max available.

    const startIndex = Math.max(0, historyLength - totalMonths);
    const relevantHistory = ipcaHistory.slice(startIndex);

    // If we don't have enough data for the full requested period, we just run with what we have
    // (or we could loop/repeat, but "Real History" implies we shouldn't fake it).

    const data: SimulationResult[] = [];
    let currentNominal = initialAmount;

    // Initial Point (Year 0) - Label it as the start year of the backtest? 
    // Or relative "Year 0"? Chart typically shows 0 to N.
    data.push({
        year: 0,
        nominalValue: initialAmount,
        realValue: initialAmount,
    });



    // Re-run loop with state
    let cumulativeInflation = 1.0;

    // We reset nominal/real for the loop
    currentNominal = initialAmount;

    relevantHistory.forEach((monthData, i) => {
        const monthIndex = i + 1;

        // Nominal update - NO Contribution
        currentNominal = currentNominal * (1 + savingsRate);

        // Inflation update
        cumulativeInflation = cumulativeInflation * (1 + monthData.value);

        // Real Value in "Year 0 Prices"
        const realValue = currentNominal / cumulativeInflation;

        // Store yearly points or all points? 
        // For "Jagged" chart, we need granular data. Monthly is best.
        // But Recharts might get heavy with 120+ points? 120 is fine.
        // Let's map to relative "Year" for x-axis (0, 0.08, 0.16...)

        data.push({
            year: Number((monthIndex / 12).toFixed(2)),
            nominalValue: Math.round(currentNominal),
            realValue: Math.round(realValue),
        });
    });

    const lastPoint = data[data.length - 1];

    return {
        data,
        finalNominal: lastPoint.nominalValue,
        finalReal: lastPoint.realValue,
        // Add metadata for UI (Start Date of backtest)
        periodLabel: `${relevantHistory[0].date} - ${relevantHistory[relevantHistory.length - 1].date}`
    };
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
