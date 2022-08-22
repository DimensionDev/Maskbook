import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function NFTPage({ socialAddress, identity }: NFTPageProps) {
    if (!socialAddress) return null

    return (
        <CollectionList
            addressName={socialAddress}
            persona={identity?.publicKey}
            twitterId={identity?.identifier?.userId.toLowerCase()}
        />
    )
}
