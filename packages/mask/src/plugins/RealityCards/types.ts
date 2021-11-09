export interface Market {
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
    giveawayText?: string
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
    state: MarketState
    sumOfAllPrices: string
    totalCollected: string
    totalCollectedTimestampSet: string
    version: string
    winnerCut: string
    winningOutcome: Factory | null
}

export enum MarketState {
    Open = 'open',
    Withdraw = 'withdraw',
    Locked = 'locked',
}

export interface Factory {
    __typename: FactoryTypename
    id: string
}

export interface Card extends Factory {
    image: string
    price: string
    outcomeName: string
    marketCardIndex: string
    originalNft: OriginalNft
    longestOwner: Factory
}

export interface OriginalNft extends Factory {
    owner: Factory
}

export enum FactoryTypename {
    Card = 'Card',
    Factory = 'Factory',
    Rent = 'Rent',
    Account = 'Account',
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
