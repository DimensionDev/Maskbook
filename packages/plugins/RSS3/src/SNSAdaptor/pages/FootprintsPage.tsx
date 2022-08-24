import { memo, useState, useMemo } from 'react'
import { CollectionDetailCard, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { Box, BoxProps, Typography, Box, Typography } from '@mui/material'
import { useI18N, useI18N } from '../../locales'
import { FootprintCard, StatusBox } from '../components'
import { useFootprints, useRSS3Profile } from '../hooks'
import { Icons } from '@masknet/icons'
import { differenceWith } from 'lodash-unified'
import { RSS3_DEFAULT_IMAGE } from '../../constants'

export interface FootprintPageProps extends BoxProps {
    address: string
    publicKey?: string
    userId: string
}

export const FootprintsPage = memo(function FootprintsPage({
    address,
    publicKey,
    userId,
    ...rest
}: FootprintPageProps) {
    const t = useI18N()
    const { value: profile } = useRSS3Profile(address)
    const username = profile?.name

    const { value: allFootprints = EMPTY_LIST, loading } = useFootprints(address)

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(userId, publicKey, {
        address,
        hiddenAddressesKey: 'footprints',
        collectionKey: CollectionType.Footprints,
    })

    const footprints = useMemo(() => {
        if (!hiddenList.length) return allFootprints
        return differenceWith(allFootprints, hiddenList, (footprint, id) => footprint.hash === id)
    }, [allFootprints, hiddenList])

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Footprint | undefined>()

    if (loading || !footprints.length) {
        return (
            <Box p={2} {...rest}>
                <StatusBox loading={loading} description={t.no_Footprint_found()} empty={!footprints.length} />
            </Box>
        )
    }

    if (isHiddenAddress) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height={400}
                p={2}
                boxSizing="border-box"
                {...rest}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_data({ collection: CollectionType.Footprints })}
                </Typography>
            </Box>
        )
    }

    const action = selectedFootprint?.actions[0]

    return (
        <Box p={2} {...rest}>
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4 ">
                {footprints.map((footprint) => (
                    <FootprintCard
                        key={footprint.hash}
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
                    img={action?.metadata?.image || RSS3_DEFAULT_IMAGE}
                    title={action?.metadata?.name}
                    referenceURL={action?.related_urls?.[0]}
                    description={action?.metadata?.description}
                    type={CollectionType.Footprints}
                    time={selectedFootprint.timestamp}
                />
            ) : null}
        </Box>
    )
})
