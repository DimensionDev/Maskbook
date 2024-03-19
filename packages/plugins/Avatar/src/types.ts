import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
    owner: string
    slug: string
}

export type AllChainsNonFungibleToken = Web3Helper.NonFungibleTokenAll

export interface SelectTokenInfo {
    account: string
    token: AllChainsNonFungibleToken
    image: string
    pluginID: NetworkPluginID
}

export enum PFP_TYPE {
    BACKGROUND = 'background',
    PFP = 'pfp',
}
