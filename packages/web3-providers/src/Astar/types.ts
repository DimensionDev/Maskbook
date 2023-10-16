export interface EstimateSuggestResponse {
    tip: Tip
    slow?: string
    average?: string
    fast?: string
    estimatedBaseFee: string
    eip1559: Eip1559
    timestamp: number
}

interface Eip1559 {
    priorityFeePerGas: Tip
    baseFeePerGas: string
}

interface Tip {
    average: string
    slow: string
    fast: string
}
