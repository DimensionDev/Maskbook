import { memo, useMemo, useState } from 'react'
import { CollectionDetailCard } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { FootprintCard, StatusBox } from '../components'
import { useFootprints, useRSS3Profile, useAvailableCollections } from '../hooks'
import { useKV } from '../hooks/useKV'
import { PluginId } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { isSameAddress } from '@masknet/web3-shared-base'

export interface FootprintPageProps {
    address: string
    publicKey?: string
    userId: string
}

export const FootprintsPage = memo(function FootprintsPage({ address, publicKey, userId }: FootprintPageProps) {
    const { value: profile } = useRSS3Profile(address)
    const username = profile?.name

    const { value: kvValue } = useKV(publicKey)
    const { value: allFootprints = EMPTY_LIST, loading } = useFootprints(formatEthereumAddress(address))

    const footprints = useAvailableCollections(
        kvValue?.proofs ?? EMPTY_LIST,
        allFootprints,
        CollectionType.Footprints,
        userId,
        address,
    )

    const isHiddenAddress = useMemo(() => {
        return kvValue?.proofs
            .find((proof) => proof?.platform === NextIDPlatform.Twitter && proof?.identity === userId?.toLowerCase())
            ?.content?.[PluginId.Web3Profile]?.hiddenAddresses?.footprints?.some((x) =>
                isSameAddress(x.address, address),
            )
    }, [userId, address, kvValue?.proofs])
    const t = useI18N()

    const [selectedFootprint, setSelectedFootprint] = useState<RSS3BaseAPI.Collection | undefined>()

    if (loading || !footprints.length) {
        return <StatusBox loading={loading} description={t.no_Footprint_found()} empty={!footprints.length} />
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
        <Box margin="16px 0 0 16px">
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
