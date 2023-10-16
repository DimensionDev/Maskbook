interface Contract {
    id: string
}

export interface Project {
    active: boolean
    complete: boolean
    projectId: string
    maxInvocations: number
    website: string
    artistName: string
    artistAddress: string
    description: string
    license: string
    pricePerTokenInWei: string
    currencyAddress: string
    currencySymbol: string
    scriptJSON: string | null
    name: string
    royaltyPercentage: string
    invocations: string
    paused: boolean
    contract: Contract
}
