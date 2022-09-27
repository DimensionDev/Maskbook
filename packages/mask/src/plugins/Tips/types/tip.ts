import type { NetworkPluginID, SocialAddressType } from '@masknet/web3-shared-base'

export enum TipsType {
    Tokens = 'tokens',
    Collectibles = 'collectibles',
}

export interface TipsAccount {
    pluginId: NetworkPluginID
    address: string
    name?: string
    type?: SocialAddressType
    /** Verified by NextId. */
    verified?: boolean
    /** From SNS profile */
    isSocialAddress?: boolean
    last_checked_at?: string
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
