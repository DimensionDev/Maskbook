export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface TipTask {
    to?: string
    recipientSnsId?: string
    addresses: string[]
}

export type TipNFTKeyPair = [address: string, tokenId: string]
