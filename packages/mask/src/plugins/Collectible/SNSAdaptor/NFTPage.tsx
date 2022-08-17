import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
    disableSidebar?: boolean
}

export function NFTPage({ socialAddress, identity, disableSidebar }: NFTPageProps) {
    if (!socialAddress) return null
    return (
        <CollectionList
            addressName={socialAddress}
            persona={identity?.publicKey}
            disableSidebar={disableSidebar}
            profile={identity}
        />
    )
}
