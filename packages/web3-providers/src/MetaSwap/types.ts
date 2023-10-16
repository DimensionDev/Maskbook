interface EstimateSuggestOption {
    maxWaitTimeEstimate: number
    minWaitTimeEstimate: number
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
}

export interface EstimateSuggestResponse {
    estimatedBaseFee: string
    low?: EstimateSuggestOption
    medium?: EstimateSuggestOption
    high?: EstimateSuggestOption
}
