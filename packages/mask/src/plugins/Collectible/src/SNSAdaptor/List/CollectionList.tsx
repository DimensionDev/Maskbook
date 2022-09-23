import { useEffect, useMemo, useState } from 'react'
import { differenceWith, uniqBy } from 'lodash-unified'
import { Icons } from '@masknet/icons'
import { ElementAnchor, RetryHint, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { useNonFungibleAssets, useTrustedNonFungibleTokens } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, EMPTY_OBJECT } from '@masknet/shared-base'
import { LoadingBase } from '@masknet/theme'
import { CollectionType } from '@masknet/web3-providers'
import {
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleCollection,
    SocialAddress,
    SocialIdentity,
} from '@masknet/web3-shared-base'
import { Box, Button, Stack, Typography, styled } from '@mui/material'
import { CollectibleList } from './CollectibleList.js'
import { CollectionIcon } from './CollectionIcon.js'
import { CollectibleGridProps, useStyles } from './hooks/useStyles.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useI18N } from '../../../../../utils/index.js'

const AllButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

export interface CollectionListProps {
    addressName: SocialAddress<NetworkPluginID>
    persona?: string
    profile?: SocialIdentity
    gridProps?: CollectibleGridProps
}

export function CollectionList({ addressName, persona, profile, gridProps = EMPTY_OBJECT }: CollectionListProps) {
    const { address: account } = addressName
    const { t } = useI18N()
    const { classes } = useStyles(gridProps)
    const [selectedCollection, setSelectedCollection] = useState<
        NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | undefined
    >()

    useEffect(() => {
        setSelectedCollection(undefined)
    }, [account])

    const trustedNonFungibleTokens = useTrustedNonFungibleTokens() as Array<
        NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >

    const {
        value: collectibles = EMPTY_LIST,
        done,
        next: nextPage,
        error,
        retry: retryFetchCollectible,
    } = useNonFungibleAssets(addressName.networkSupporterPluginID, undefined, { account })

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(
        profile?.identifier?.userId.toLowerCase(),
        persona,
        {
            address: account,
            hiddenAddressesKey: 'NFTs',
            collectionKey: CollectionType.NFTs,
        },
    )

    const unHiddenCollectibles = useMemo(() => {
        if (!hiddenList.length) return collectibles

        return differenceWith(
            collectibles,
            hiddenList,
            (collection, id) => `${collection.id}_${collection.tokenId}`.toLowerCase() === id.toLowerCase(),
        )
    }, [hiddenList, collectibles])

    const allCollectibles = [
        ...trustedNonFungibleTokens.filter((x) => isSameAddress(x.contract?.owner, account)),
        ...unHiddenCollectibles,
    ]

    const renderCollectibles = useMemo(() => {
        if (!selectedCollection) return allCollectibles
        const uniqCollectibles = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase() + x?.tokenId)
        if (!selectedCollection) return uniqCollectibles.filter((x) => !x.collection)
        return uniqCollectibles.filter(
            (x) =>
                selectedCollection.name === x.collection?.name ||
                isSameAddress(selectedCollection.address, x.collection?.address),
        )
    }, [selectedCollection, allCollectibles.length])

    const collectionsWithName = useMemo(() => {
        const collections = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase())
            .map((x) => x?.collection)
            .filter((x) => x?.name?.length)
        return collections as Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    }, [allCollectibles.length])

    if (!allCollectibles.length && !done && !error && account)
        return (
            <Box className={classes.container}>
                <Stack spacing={1} direction="row" mb={1.5}>
                    <LoadingSkeleton className={classes.root} />
                    <div className={classes.sidebar} />
                </Stack>
            </Box>
        )

    if (!allCollectibles.length && error && account) return <RetryHint retry={nextPage} />

    if ((done && !allCollectibles.length) || !account || isHiddenAddress)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t('no_NFTs_found')}
                </Typography>
            </Box>
        )

    const showSidebar = collectionsWithName.length > 0

    return (
        <Box className={classes.container}>
            <Stack direction="row">
                <Box sx={{ flexGrow: 1 }}>
                    <Box>
                        {selectedCollection && (
                            <Box display="flex" alignItems="center" ml={2}>
                                <CollectionIcon collection={selectedCollection} />
                                <Typography
                                    className={classes.name}
                                    color="textPrimary"
                                    variant="body2"
                                    sx={{ fontSize: '16px' }}>
                                    {selectedCollection?.name}
                                    {renderCollectibles.length ? `(${renderCollectibles.length})` : null}
                                </Typography>
                            </Box>
                        )}
                        <CollectibleList
                            address={addressName}
                            retry={retryFetchCollectible}
                            collectibles={renderCollectibles}
                            loading={renderCollectibles.length === 0}
                            {...gridProps}
                        />
                    </Box>
                    {error && !done && <RetryHint hint={false} retry={nextPage} />}
                    <ElementAnchor
                        callback={() => {
                            if (nextPage) nextPage()
                        }}>
                        {!done && <LoadingBase />}
                    </ElementAnchor>
                </Box>
                {showSidebar ? (
                    <div className={classes.sidebar}>
                        <Box className={classes.collectionButton}>
                            <AllButton
                                className={classes.networkSelected}
                                onClick={() => setSelectedCollection(undefined)}>
                                ALL
                            </AllButton>
                        </Box>
                        {collectionsWithName.map((x, i) => (
                            <Box key={i} className={classes.collectionButton}>
                                <CollectionIcon
                                    selectedCollection={selectedCollection?.address}
                                    collection={x}
                                    onClick={() => {
                                        setSelectedCollection(x)
                                    }}
                                />
                            </Box>
                        ))}
                    </div>
                ) : null}
            </Stack>
        </Box>
    )
}
