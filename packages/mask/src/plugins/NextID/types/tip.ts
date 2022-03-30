export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface TipTask {
    to?: string
    recipientSnsId?: string
    addresses: string[]
}
