import { CollectionDetailCard } from '@masknet/shared'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { useState } from 'react'
import { FootprintCard, StatusBox } from '../components'
import { useRss3Profile } from '../hooks'

export interface FootprintPageProps {
    footprints?: RSS3BaseAPI.Footprint[]
    loading?: boolean
    address: SocialAddress<NetworkPluginID>
}

export function FootprintPage({ footprints = [], address, loading }: FootprintPageProps) {
    const { value: profile } = useRss3Profile(address.address || '')
    const username = profile?.name

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Footprint | undefined>()

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} empty={!footprints.length} />
    }

    return (
        <>
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
                {footprints.map((footprint) => (
                    <FootprintCard
                        key={footprint.id}
                        onSelect={() => setSelectedFootprint(footprint)}
                        username={username ?? ''}
                        footprint={footprint}
                    />
                ))}
            </section>
            <CollectionDetailCard
                open={Boolean(selectedFootprint)}
                onClose={() => setSelectedFootprint(undefined)}
                img={selectedFootprint?.detail?.image_url}
                title={selectedFootprint?.detail?.name}
                referenceUrl={selectedFootprint?.detail?.event_url}
                description={selectedFootprint?.detail?.description}
                date={selectedFootprint?.detail?.end_date}
                location={selectedFootprint?.detail?.city || selectedFootprint?.detail?.country || 'Metaverse'}
            />
        </>
    )
}
