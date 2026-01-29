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

    // 1. Determine Window & Cycle Strategy
    // The user can select up to 50 years. Our data might be shorter (e.g. 10-16 years).
    // If years > history, we CYCLE the historical data to simulate a long-term "Chaotic Reality".

    const totalMonths = years * 12;
    const historyLength = ipcaHistory.length;

    // Use strict backtest logic if we have enough data (Last N years)
    // Use cyclic logic if we don't (Repeat the history we have)
    const isCyclic = totalMonths > historyLength;

    const data: SimulationResult[] = [];
    let currentNominal = initialAmount;

    // Initial Point
    data.push({
        year: 0,
        nominalValue: initialAmount,
        realValue: initialAmount,
    });

    let cumulativeInflation = 1.0;

    // We loop for the requested duration
    for (let month = 1; month <= totalMonths; month++) {
        // Determine which historical month to use
        // If cyclic: loop from start (0).
        // If strict backtest: align so we end at the last data point.
        let historyIndex;

        if (isCyclic) {
            // Simple cycle: 0 -> end -> 0 -> end
            historyIndex = (month - 1) % historyLength;
        } else {
            // Rolling backtest: End of sim = End of data
            // Start index = TotalData - SimMonths
            // Current index = Start + (month - 1)
            const startIndex = historyLength - totalMonths;
            historyIndex = startIndex + (month - 1);
        }

        const monthData = ipcaHistory[historyIndex];

        // Nominal update (Savings Rate)
        currentNominal = currentNominal * (1 + savingsRate);

        // Inflation update (Cumulative)
        if (monthData) {
            cumulativeInflation = cumulativeInflation * (1 + monthData.value);
        }

        // Real Value
        const realValue = currentNominal / cumulativeInflation;

        // Store data
        data.push({
            year: Number((month / 12).toFixed(2)),
            nominalValue: Math.round(currentNominal),
            realValue: Math.round(realValue),
        });
    }

    const lastPoint = data[data.length - 1];

    // Label logic
    let periodLabel = "";
    if (isCyclic) {
        periodLabel = `Projeção baseada em ciclos repetidos do histórico (${ipcaHistory[0].date} - ${ipcaHistory[historyLength - 1].date})`;
    } else {
        // Safe access
        const start = ipcaHistory[historyLength - totalMonths];
        const end = ipcaHistory[historyLength - 1];
        if (start && end) {
            periodLabel = `${start.date} - ${end.date}`;
        }
    }

    return {
        data,
        finalNominal: lastPoint.nominalValue,
        finalReal: lastPoint.realValue,
        periodLabel
    };
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
