export enum TipType {
    Token = 'token',
    NFT = 'nft',
}

export interface TipsAccount {
    address: string
    name?: string
    verified?: boolean
}
export interface TipTask {
    recipient?: string
    recipientSnsId?: string
    addresses: TipsAccount[]
}

export type TipNFTKeyPair = [address: string, tokenId: string]

export type TipsSettingType = {
    hiddenAddresses?: string[]
    defaultAddress?: string
}
