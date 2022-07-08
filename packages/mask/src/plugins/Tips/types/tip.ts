export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface TipAccount {
    address: string
    name?: string
    verified?: boolean
}
export interface TipTask {
    recipient?: string
    recipientSnsId?: string
    addresses: TipAccount[]
}

export type TipNFTKeyPair = [address: string, tokenId: string]
