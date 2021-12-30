export interface estimateSuggestOption {
    maxWaitTimeEstimate: number
    minWaitTimeEstimate: number
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
}

export interface estimateSuggestResponse {
    estimatedBaseFee: string
    low?: estimateSuggestOption
    medium?: estimateSuggestOption
    high?: estimateSuggestOption
}
