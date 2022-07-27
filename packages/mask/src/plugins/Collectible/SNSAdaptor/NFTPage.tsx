import type { SocialAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { useCurrentVisitingProfile } from '../hooks/useContext'

export interface NFTPageProps {
    identity?: SocialIdentity
    socialAddress?: SocialAddress<NetworkPluginID>
    persona?: string
}

export function NFTPage({ socialAddress, persona }: NFTPageProps) {
    const currentVisitingProfile = useCurrentVisitingProfile()

    if (!socialAddress) return null

    return <CollectionList addressName={socialAddress} persona={persona} visitingProfile={currentVisitingProfile} />
}
