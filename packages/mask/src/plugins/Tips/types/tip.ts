export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface AddressConfig {
    address: string
    name?: string
    verified?: boolean
}
export interface TipTask {
    to?: string
    recipientSnsId?: string
    addresses: AddressConfig[]
}

export type TipNFTKeyPair = [address: string, tokenId: string]
