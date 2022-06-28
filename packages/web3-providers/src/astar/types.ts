export interface EstimateSuggestOption {
    maxWaitTimeEstimate: number
    minWaitTimeEstimate: number
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
}

export interface EstimateSuggestResponse {
    tip: Tip
    slow?: string
    average?: string
    fast?: string
    estimatedBaseFee: string
    low?: EstimateSuggestOption
    medium?: EstimateSuggestOption
    high?: EstimateSuggestOption
    eip1559: Eip1559
    timestamp: number
}

export interface Eip1559 {
    priorityFeePerGas: Tip
    baseFeePerGas: string
}

export interface Tip {
    average: string
    slow: string
    fast: string
}
