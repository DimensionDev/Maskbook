import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import {
    CollectibleGridProps,
    CollectionList as CollectibleListShared,
} from '../../../../extension/options-page/DashboardComponents/CollectibleList/index.js'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
    gridProps?: CollectibleGridProps
}

export function CollectibleList({ socialAddress, identity, gridProps }: NFTPageProps) {
    if (!socialAddress) return null
    return (
        <CollectibleListShared
            addressName={socialAddress}
            persona={identity?.publicKey}
            profile={identity}
            gridProps={gridProps}
        />
    )
}
