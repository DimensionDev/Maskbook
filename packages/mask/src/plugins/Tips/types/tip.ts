import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount } from '@masknet/web3-shared-base'

export enum TipsType {
    Tokens = 'tokens',
    Collectibles = 'collectibles',
}

export interface TipTask {
    recipient?: string
    recipientSnsId?: string
    accounts: SocialAccount<Web3Helper.ChainIdAll>[]
}

export type TipNFTKeyPair = [address: string, tokenId: string]

export type TipsSettingType = {
    hiddenAddresses?: string[]
    defaultAddress?: string
}
