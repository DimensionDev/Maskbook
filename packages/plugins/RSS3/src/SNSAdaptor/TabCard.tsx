import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useCollectionFilter, useDonations, useFootprints } from './hooks'
import { DonationPage, FootprintPage } from './pages'
import { useCurrentVisitingProfile } from './hooks/useContext'
import { CollectionType, KVType } from '../types'
import { useKV } from './hooks/useKV'

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
}

export interface TabCardProps {
    persona?: string
    type: TabCardType
    socialAddress?: SocialAddress<NetworkPluginID>
}

export function TabCard({ type, socialAddress, persona }: TabCardProps) {
    const { value: donations = EMPTY_LIST, loading: loadingDonations } = useDonations(
        formatEthereumAddress(socialAddress?.address ?? ZERO_ADDRESS),
    )
    const { value: footprints = EMPTY_LIST, loading: loadingFootprints } = useFootprints(
        formatEthereumAddress(socialAddress?.address ?? ZERO_ADDRESS),
    )
    const currentVisitingProfile = useCurrentVisitingProfile()

    const { value: kvValue } = useKV(persona)
    const unHiddenDonations = useCollectionFilter(
        kvValue?.proofs ?? EMPTY_LIST,
        donations,
        CollectionType.Donations,
        currentVisitingProfile,
        socialAddress,
    )
    const unHiddenFootprints = useCollectionFilter(
        (kvValue as KVType)?.proofs,
        footprints,
        CollectionType.Footprints,
        currentVisitingProfile,
        socialAddress,
    )

    if (!socialAddress) return null

    const isDonation = type === TabCardType.Donation

    return isDonation ? (
        <DonationPage donations={unHiddenDonations} loading={loadingDonations} addressLabel={socialAddress.label} />
    ) : (
        <FootprintPage
            address={socialAddress.address}
            loading={loadingFootprints}
            footprints={unHiddenFootprints}
            addressLabel={socialAddress.label}
        />
    )
}
