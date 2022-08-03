import { CollectionDetailCard } from '@masknet/shared'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { Box } from '@mui/material'
import { useState } from 'react'
import { FootprintCard, StatusBox } from '../components'
import { useRSS3Profile } from '../hooks'
import { useI18N } from '../../locales'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType } from '../../constants'

export interface FootprintPageProps {
    footprints?: RSS3BaseAPI.Collection[]
    loading?: boolean
    address: SocialAddress<NetworkPluginID>
}

export function FootprintPage({ footprints = EMPTY_LIST, address, loading }: FootprintPageProps) {
    const { value: profile } = useRSS3Profile(address.address || '')
    const username = profile?.name

    const t = useI18N()

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} description={t.no_Footprint_found()} empty={!footprints.length} />
    }

    return (
        <Box margin="16px 0 0 16px">
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4 ">
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
                img={selectedFootprint?.imageURL}
                title={selectedFootprint?.title}
                referenceURL={selectedFootprint?.actions?.[0]?.related_urls?.[0]}
                description={selectedFootprint?.description}
                type={CollectionType.footprints}
                time={selectedFootprint?.timestamp}
                location={selectedFootprint?.location}
            />
        </Box>
    )
}
