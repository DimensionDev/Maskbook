export enum OrderStatus {
    CANCELLED = 'CANCELLED',
    ERC_APPROVAL = 'ERC_APPROVAL',
    ERC20_APPROVAL = 'ERC20_APPROVAL',
    ERC20_BALANCE = 'ERC20_BALANCE',
    EXECUTED = 'EXECUTED',
    EXPIRED = 'EXPIRED',
    INVALID_OWNER = 'INVALID_OWNER',
    VALID = 'VALID',
}

export enum EventType {
    MINT = 'MINT',
    TRANSFER = 'TRANSFER',
    LIST = 'LIST',
    SALE = 'SALE',
    OFFER = 'OFFER',
    CANCEL_LIST = 'CANCEL_LIST',
    CANCEL_OFFER = 'CANCEL_OFFER',
}

export enum TokenFlag {
    NO_IMAGE = 'NO_IMAGE',
    NONE = 'NONE',
    PORNOGRAPHY = 'PORNOGRAPHY',
    TRIAGE = 'TRIAGE',
}

export interface Account {
    address: string
    profile_img_url: string
    user?: {
        username: string
    }
}

export interface Attribute {
    traitType: string
    value: string
    displayType: string
    floorOrder?: Order
}

export interface Collection {
    address: string
    owner: string
    name?: string
    description?: string
    symbol?: string
    type: 'ERC721' | 'ERC1155'
    websiteLink?: string
    facebookLink?: string
    twitterLink?: string
    instagramLink?: string
    telegramLink?: string
    mediumLink?: string
    discordLink?: string
    isVerified: boolean
    isExplicit: boolean
}

export interface Order {
    hash: string
    collectionAddress: string
    tokenId?: string
    isOrderAsk: boolean
    signer: string
    strategy: string
    currencyAddress: string
    amount: number
    price: string
    nonce: string
    startTime: number
    endTime: number
    minPercentageToAsk: number
    params?: string
    status: OrderStatus
    signature: string
    v?: number
    r?: string
    s?: string
}

export interface Stats {
    address: number
    countOwners: number
    totalSupply: number
    floorPrice: number
    floorChange24h: number
    floorChange7d: number
    floorChange30d: number
    marketCap: number
    volume24h: number
    average24h: number
    count24h: number
    change24h: number
    volume7d: number
    average7d: number
    count7d: number
    change7d: number
    volume1m: number
    average1m: number
    count1m: number
    change1m: number
    volume3m: number
    average3m: number
    count3m: number
    change3m: number
    volume6m: number
    average6m: number
    count6m: number
    change6m: number
    volume1y: number
    average1y: number
    count1y: number
    change1y: number
    volumeAll: number
    averageAll: number
    countAll: number
}

export interface Token {
    id: number
    collectionAddress: string
    tokenId: string
    tokenURI?: string
    imageURI: string
    isExplicit: boolean
    isAnimated: boolean
    flag: TokenFlag
    collection?: Collection
    attributes: Attribute[]
}

export interface Event {
    id: number
    from: string
    to: string
    type: EventType
    hash: string
    createdAt: string
    collection?: Collection
    token?: Token
    order?: Order
}
