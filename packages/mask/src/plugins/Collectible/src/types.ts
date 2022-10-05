import type { WyvernSchemaName } from 'opensea-js/lib/types'
import type { SourceType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export enum ActivityType {
    Transfer = 'Transfer',
    Mint = 'Mint',
    Sale = 'Sale',
    Offer = 'Offer',
    List = 'List',
    CancelOffer = 'Cancel Offer',
}

export enum TabType {
    About = 'About',
    Offers = 'Offers',
    Activities = 'Activities',
}

export interface CollectiblePayload {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    address: string
    provider?: SourceType
}

export enum CollectibleTab {
    ABOUT = 0,
    DETAILS = 1,
    OFFERS = 2,
    ACTIVITY = 3,
}

export interface CollectibleToken {
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    contractAddress: string
    schemaName?: WyvernSchemaName
    provider?: SourceType
}
