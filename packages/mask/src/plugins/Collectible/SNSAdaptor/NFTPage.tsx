import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { useCurrentVisitingProfile } from '../hooks/useContext'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function NFTPage({ socialAddress, identity }: NFTPageProps) {
    const currentVisitingProfile = useCurrentVisitingProfile()

    if (!socialAddress) return null

    return (
        <CollectionList
            addressName={socialAddress}
            persona={identity?.publicKey}
            visitingProfile={currentVisitingProfile}
        />
    )
}
