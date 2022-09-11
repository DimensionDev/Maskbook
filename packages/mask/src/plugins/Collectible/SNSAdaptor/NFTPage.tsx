import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import {
    CollectibleGridProps,
    CollectionList,
} from '../../../extension/options-page/DashboardComponents/CollectibleList/index.js'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
    gridProps?: CollectibleGridProps
}

export function NFTPage({ socialAddress, identity, gridProps }: NFTPageProps) {
    if (!socialAddress) return null
    return (
        <CollectionList
            addressName={socialAddress}
            persona={identity?.publicKey}
            profile={identity}
            gridProps={gridProps}
        />
    )
}
