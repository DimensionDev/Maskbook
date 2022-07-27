import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useCollectionFilter, useDonations, useFootprints } from './hooks'
import { DonationPage, FootprintPage } from './pages'
import { useCurrentVisitingProfile } from './hooks/useContext'
import { CollectionType, KVType } from '../types'
import { useKV } from './hooks/useKV'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { FeedPage } from './pages/FeedPage'
import { useMemo } from 'react'

export enum TabCardType {
    Donation = 1,
    Footprint = 2,
    Feed = 3,
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

    const page = useMemo(() => {
        if (!socialAddress) return null
        if (type === TabCardType.Donation) {
            return (
                <DonationPage
                    donations={unHiddenDonations as RSS3BaseAPI.Donation[]}
                    loading={loadingDonations}
                    address={socialAddress}
                />
            )
        }
        if (type === TabCardType.Footprint) {
            return (
                <FootprintPage
                    address={socialAddress}
                    loading={loadingFootprints}
                    footprints={unHiddenFootprints as RSS3BaseAPI.Footprint[]}
                />
            )
        }
        if (type === TabCardType.Feed) {
            return <FeedPage socialAddress={socialAddress} />
        }
        return null
    }, [type, socialAddress, persona])

    if (!socialAddress) return null

    return page
}
