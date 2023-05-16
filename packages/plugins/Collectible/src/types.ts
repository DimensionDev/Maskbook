import type { SourceType } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

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

export interface CollectibleGridProps {
    columns?: number
    gap?: string | number
}
