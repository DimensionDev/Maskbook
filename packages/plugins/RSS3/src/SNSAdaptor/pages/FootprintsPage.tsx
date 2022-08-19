import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { memo, useState } from 'react'
import { useI18N } from '../../locales'
import { FootprintCard, StatusBox } from '../components'
import { useFootprints, useRSS3Profile, useAvailableCollections } from '../hooks'
import { useKV } from '../hooks/useKV'

export interface FootprintPageProps {
    address: string
    publicKey: string
    userId: string
}

export const FootprintsPage = memo(function FootprintsPage({ address, publicKey, userId }: FootprintPageProps) {
    const { value: profile } = useRSS3Profile(address)
    const username = profile?.name

    const { value: kvValue } = useKV(publicKey)
    const { value: allFootprints = EMPTY_LIST, loading } = useFootprints(formatEthereumAddress(address))

    const footprints = useAvailableCollections(
        kvValue?.proofs ?? EMPTY_LIST,
        CollectionType.Footprints,
        allFootprints,
        userId,
        address,
    )

    const t = useI18N()

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !footprints.length) {
        return <StatusBox loading description={t.no_Footprint_found()} empty={!footprints.length} />
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
                type={CollectionType.Footprints}
                time={selectedFootprint?.timestamp}
                location={selectedFootprint?.location}
            />
        </Box>
    )
})
