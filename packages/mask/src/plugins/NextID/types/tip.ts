export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface TipTask {
    to?: string
    snsID?: string
    addresses: string[]
}
