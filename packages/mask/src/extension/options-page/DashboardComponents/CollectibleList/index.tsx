import { createContext, useEffect, useMemo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import {
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    SocialAddress,
    SourceType,
    Wallet,
} from '@masknet/web3-shared-base'
import { Box, Button, Stack, styled, Typography } from '@mui/material'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { ElementAnchor, RetryHint } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import { useNonFungibleAssets, useTrustedNonFungibleTokens, Web3Helper } from '@masknet/plugin-infra/web3'
import { CollectibleCard } from './CollectibleCard'
import { useI18N } from '../../../../utils'
import { CollectionIcon } from './CollectionIcon'
import { LoadingSkeleton } from './LoadingSkeleton'
import { useCollectionFilter } from '../../hooks/useCollectionFilter'
import { useKV } from '../../hooks/useKV'
import { COLLECTION_TYPE } from '../../types'
import { Icons } from '@masknet/icons'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
        gridGap: theme.spacing(1),
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    button: {
        '&:hover': {
            border: 'solid 1px transparent',
        },
    },
    container: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
    },
    card: {
        width: 172,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1, 0),
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        paddingLeft: '8px',
    },
    loading: {
        position: 'absolute',
        bottom: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    collectionWrap: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(229,232,235,1)',
    },
    collectionImg: {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    networkSelected: {
        width: 24,
        height: 24,
        minHeight: 24,
        minWidth: 24,
        lineHeight: '24px',
        background: theme.palette.primary.main,
        color: '#ffffff',
        fontSize: 10,
        opacity: 1,
        '&:hover': {
            background: theme.palette.primary.main,
        },
    },
}))

interface CollectibleItemProps {
    provider: SourceType
    wallet?: Wallet
    link?: string
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    readonly?: boolean
    renderOrder: number
    address?: SocialAddress<NetworkPluginID>
}

function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, asset, readonly, renderOrder, address } = props
    const { classes } = useStyles()
    return (
        <div className={classes.card}>
            <CollectibleCard
                asset={asset}
                provider={provider}
                wallet={wallet}
                readonly={readonly}
                renderOrder={renderOrder}
                address={address}
            />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {asset.metadata?.name}
                </Typography>
            </div>
        </div>
    )
}

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: SourceType
    wallet?: Wallet
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    loading: boolean
    collectiblesRetry: () => void
    error: string | undefined
    readonly?: boolean
    hasRetry?: boolean
    address?: SocialAddress<NetworkPluginID>
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const {
        provider,
        wallet,
        collectibles,
        loading,
        collectiblesRetry,
        error,
        readonly,
        hasRetry = true,
        address,
    } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {loading && <LoadingSkeleton />}
                {error || (collectibles.length === 0 && !loading) ? (
                    <Box className={classes.text}>
                        <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                        {hasRetry ? (
                            <Button className={classes.button} variant="text" onClick={() => collectiblesRetry()}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        ) : null}
                    </Box>
                ) : (
                    <Box className={classes.root}>
                        {collectibles.map((token, index) => (
                            <CollectibleItem
                                renderOrder={index}
                                asset={token}
                                provider={provider}
                                wallet={wallet}
                                readonly={readonly}
                                key={index}
                                address={address}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListProps extends withClasses<'empty' | 'button'> {
    address: SocialAddress<NetworkPluginID>
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: string
    loading: boolean
    retry(): void
}

export function CollectibleList(props: CollectibleListProps) {
    const { address, collectibles, error, loading, retry } = props
    const classes = props.classes ?? {}

    return (
        <CollectibleListUI
            provider={SourceType.OpenSea}
            classes={classes}
            collectibles={collectibles}
            loading={loading}
            collectiblesRetry={retry}
            error={error}
            readonly
            address={address}
            hasRetry={!!address}
        />
    )
}

export function CollectionList({
    addressName,
    persona,
    visitingProfile,
}: {
    addressName: SocialAddress<NetworkPluginID>
    persona?: string
    visitingProfile?: IdentityResolved
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [selectedCollection, setSelectedCollection] = useState<
        NonFungibleTokenCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | 'all' | undefined
    >('all')
    const { address: account } = addressName

    useEffect(() => {
        setSelectedCollection('all')
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

    const { value: kvValue } = useKV(persona)

    const userId = visitingProfile?.identifier?.userId.toLowerCase()
    const isHiddenAddress = useMemo(() => {
        return kvValue?.proofs
            .find((proof) => proof?.platform === NextIDPlatform.Twitter && proof?.identity === userId)
            ?.content?.[PluginId.Web3Profile]?.hiddenAddresses?.NFTs?.some((x) =>
                isSameAddress(x.address, addressName.address),
            )
    }, [userId, addressName.address, kvValue?.proofs])

    const unHiddenCollectibles = useCollectionFilter(
        kvValue?.proofs ?? EMPTY_LIST,
        collectibles,
        COLLECTION_TYPE.NFTs,
        visitingProfile,
        account?.toLowerCase(),
    )

    const allCollectibles = [
        ...trustedNonFungibleTokens.filter((x) => isSameAddress(x.contract?.owner, account)),
        ...unHiddenCollectibles,
    ]

    const renderCollectibles = useMemo(() => {
        if (selectedCollection === 'all') return allCollectibles
        const uniqCollectibles = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase() + x?.tokenId)
        if (!selectedCollection) return uniqCollectibles.filter((x) => !x.collection)
        return uniqCollectibles.filter(
            (x) =>
                selectedCollection.name === x.collection?.name ||
                isSameAddress(selectedCollection.address, x.collection?.address),
        )
    }, [selectedCollection, allCollectibles.length])

    const collections = useMemo(() => {
        return uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase())
            .map((x) => x?.collection)
            .filter(Boolean) as Array<NonFungibleTokenCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    }, [allCollectibles.length])

    const isFromAlchemy = collections?.findIndex((collection) => collection?.name?.length > 0) === -1

    if (!allCollectibles.length && !done && !error && account) return <LoadingSkeleton />

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

    return (
        <Box marginLeft="16px">
            <Stack spacing={1} direction="row" mt={1.5}>
                <Box sx={{ flexGrow: 1 }}>
                    <Box>
                        {!selectedCollection && selectedCollection !== 'all' && (
                            <Box display="flex" alignItems="center">
                                <Typography
                                    className={classes.name}
                                    color="textPrimary"
                                    variant="body2"
                                    sx={{ fontSize: '16px' }}>
                                    Other
                                    {renderCollectibles.length ? `(${renderCollectibles.length})` : null}
                                </Typography>
                            </Box>
                        )}
                        {selectedCollection && selectedCollection !== 'all' && (
                            <Box display="flex" alignItems="center">
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
                {!isFromAlchemy && (
                    <Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ marginTop: '8px', marginBottom: '12px', minWidth: 30, maxHeight: 24 }}>
                            <AllNetworkButton
                                className={classes.networkSelected}
                                onClick={() => setSelectedCollection('all')}>
                                ALL
                            </AllNetworkButton>
                        </Box>
                        {collections.map((x, i) => {
                            return (
                                x?.name?.length > 0 && (
                                    <Box
                                        display="flex"
                                        key={i}
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            marginTop: '8px',
                                            marginBottom: '12px',
                                            minWidth: 30,
                                            maxHeight: 24,
                                        }}>
                                        <CollectionIcon
                                            selectedCollection={
                                                selectedCollection === 'all' ? undefined : selectedCollection?.address
                                            }
                                            collection={x}
                                            onClick={() => {
                                                setSelectedCollection(x)
                                            }}
                                        />
                                    </Box>
                                )
                            )
                        })}
                    </Box>
                )}
            </Stack>
        </Box>
    )
}
