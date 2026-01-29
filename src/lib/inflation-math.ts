export interface SimulationParams {
    initialAmount: number;
    monthlyContribution: number;
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
    monthlyContribution,
    years,
    inflationRate = 0.045,
    savingsRate = 0.005,
}: SimulationParams): { data: SimulationResult[]; finalNominal: number; finalReal: number } => {
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
        // Nominal Growth: Apply monthly yield + contribution
        currentNominal = currentNominal * (1 + savingsRate) + monthlyContribution;

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

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
