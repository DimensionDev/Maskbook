import { Icons } from '@masknet/icons'
import { CollectionDetailCard, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { Box, BoxProps, Typography } from '@mui/material'
import { differenceWith } from 'lodash-unified'
import { memo, useMemo, useState } from 'react'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { useI18N } from '../../locales'
import { FootprintList, FootprintsLayoutProps, StatusBox } from '../components'
import { useFootprints } from '../hooks'

export interface FootprintPageProps extends BoxProps, FootprintsLayoutProps {
    address: string
    publicKey?: string
    userId: string
    collectionName?: string
}

export const FootprintsPage = memo(function FootprintsPage({
    address,
    publicKey,
    userId,
    layout,
    collectionName,
    ...rest
}: FootprintPageProps) {
    const t = useI18N()

    const { value: allFootprints = EMPTY_LIST, loading } = useFootprints(address)

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(userId, publicKey, {
        address,
        hiddenAddressesKey: 'footprints',
        collectionKey: CollectionType.Footprints,
    })

    const footprints = useMemo(() => {
        if (!hiddenList.length) return allFootprints
        return differenceWith(
            allFootprints,
            hiddenList,
            (footprint, id) => footprint.actions[0].index.toString() === id,
        )
    }, [allFootprints, hiddenList])

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Footprint | undefined>()
    const collection = collectionName ?? CollectionType.Footprints

    if (loading || !footprints.length) {
        return (
            <Box p={2} {...rest}>
                <StatusBox loading={loading} description={t.no_data({ collection })} empty={!footprints.length} />
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
                height={300}
                p={2}
                boxSizing="border-box"
                {...rest}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_data({ collection })}
                </Typography>
            </Box>
        )
    }

    const action = selectedFootprint?.actions[0]

    return (
        <Box p={2} {...rest}>
            <FootprintList footprints={footprints} onSelect={setSelectedFootprint} layout={layout} />
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
