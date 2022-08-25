import { memo, useState, useMemo } from 'react'
import { CollectionDetailCard, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { FootprintCard, StatusBox } from '../components'
import { useFootprints, useRSS3Profile } from '../hooks'
import { Icons } from '@masknet/icons'
import { differenceWith } from 'lodash-unified'
import { useI18N } from '../../locales'

export interface FootprintPageProps {
    address: string
    publicKey?: string
    userId: string
}

export const FootprintsPage = memo(function FootprintsPage({ address, publicKey, userId }: FootprintPageProps) {
    const t = useI18N()
    const { value: profile } = useRSS3Profile(address)
    const username = profile?.name

    const { value: allFootprints = EMPTY_LIST, loading } = useFootprints(formatEthereumAddress(address))

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(userId, publicKey, {
        address,
        hiddenAddressesKey: 'footprints',
        collectionKey: CollectionType.Footprints,
    })

    const footprints = useMemo(() => {
        if (!hiddenList.length) return allFootprints
        return differenceWith(allFootprints, hiddenList, (footprint, id) => footprint.id === id)
    }, [allFootprints, hiddenList])

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !footprints.length) {
        return (
            <Box p={2}>
                <StatusBox loading={loading} description={t.no_Footprint_found()} empty={!footprints.length} />
            </Box>
        )
    }

    if (isHiddenAddress) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_data({ collection: CollectionType.Footprints })}
                </Typography>
            </Box>
        )
    }

    return (
        <Box p={2}>
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4 ">
                {footprints.map((footprint) => (
                    <FootprintCard
                        key={footprint.id}
                        onSelect={setSelectedFootprint}
                        username={username ?? ''}
                        footprint={footprint}
                    />
                ))}
            </section>
            {selectedFootprint ? (
                <CollectionDetailCard
                    open
                    onClose={() => setSelectedFootprint(undefined)}
                    img={selectedFootprint.imageURL}
                    title={selectedFootprint.title}
                    referenceURL={selectedFootprint.actions?.[0]?.related_urls?.[0]}
                    description={selectedFootprint.description}
                    type={CollectionType.Footprints}
                    time={selectedFootprint.timestamp}
                    location={selectedFootprint.location}
                />
            ) : null}
        </Box>
    )
})
