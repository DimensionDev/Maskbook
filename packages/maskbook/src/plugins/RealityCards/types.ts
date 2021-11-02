export interface Event {
    __typename: string
    affiliateAddress: string
    affiliateCut: string
    approved: boolean
    artistAddress: string
    artistCut: string
    artistLink: string
    cardAffiliateAddresses: any[]
    cardAffiliateCut: string
    cards: Card[]
    category: string
    creatorCut: string
    description: string
    factory: Factory
    id: string
    invalid: boolean
    ipfsHash: string
    lockingTime: string
    marketCreatorAddress: string
    minRentalDayDivisor: string
    minimumPriceIncreasePercent: string
    mode: number
    name: string
    nftMintCount: string
    numberOfTokens: string
    openingTime: string
    oracleResolutionTime: string
    payouts: Payout[]
    questionId: string
    remainingCut: string
    rents: Factory[]
    restrictedRegions: string
    slug: string
    sponsorAmount: string
    sponsors: any[]
    state: string
    sumOfAllPrices: string
    totalCollected: string
    totalCollectedTimestampSet: string
    version: string
    winnerCut: string
    winningOutcome: null
}

export interface Factory {
    __typename: FactoryTypename
    id: string
}

export interface Card extends Factory {
    image: string
    price: string
    outcomeName: string
}

export enum FactoryTypename {
    Card = 'Card',
    Factory = 'Factory',
    Rent = 'Rent',
}

export interface Payout {
    __typename: PayoutTypename
    amount: string
    id: string
    paid: null
}

export enum PayoutTypename {
    Payout = 'Payout',
}
