export interface TreasureCreator {
    id: string
    name: string
    fee: number
}

export interface TreasureOwner {
    id: string
}

export interface TreasureAttribute {
    attribute: {
        id?: string
        name: string
        percentage?: number
        value: string
    }
}

interface TreasureTokenMetadata {
    attributes?: TreasureAttribute[]
    description: string
    image: string
    name: string
    metadata?: Record<string, any>
}

export interface TreasureTokenWithMetadata {
    token: TreasureTokenMetadata
}

export interface TreasureToken {
    id: string
    tokenId: string
    floorPrice: number | null
    metadata: TreasureTokenMetadata
    owner: TreasureOwner | null
    lowestPrice: ListingFieldsWithToken[]
    listings: {
        id: string
        status: 'Active' | 'Sold' // TODO: Are there other status?
        buyer: {
            id: string
        } | null
        pricePerItem: string
        seller: {
            id: string
        }
        blockTimestamp: string
    }[]
}

export interface TreasureTokenDetail {
    collection: {
        id: string
        name: string
        creator?: TreasureCreator
        standard: string
        tokens: TreasureToken[]
    }
}

export interface ListingFieldsWithToken {
    seller: {
        id: string
    }
    expires: string
    id: string
    pricePerItem: string
    quantity: number
}

export interface Collections {
    collections: {
        id: string
        name: string
    }[]
}
