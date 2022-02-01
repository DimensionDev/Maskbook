import { createContext, useEffect, useMemo } from 'react'
import { useValueRef } from '@masknet/shared'
import {
    ChainId,
    ERC721TokenDetailed,
    isSameAddress,
    NonFungibleAssetProvider,
    SocketState,
    useCollectibles,
    useCollections,
    Wallet,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { currentNonFungibleAssetDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'
import { Image } from '../../../../components/shared/Image'
import { WalletMessages } from '@masknet/plugin-wallet'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

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
        marginTop: theme.spacing(1),
    },
    container: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1),
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        alignSelf: 'stretch',
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
}))

interface CollectibleItemProps {
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
    renderOrder: number
}

function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, token, readonly, renderOrder } = props
    const { classes } = useStyles()
    return (
        <div className={classes.card}>
            <CollectibleCard
                token={token}
                provider={provider}
                wallet={wallet}
                readonly={readonly}
                renderOrder={renderOrder}
            />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.info.name}
                </Typography>
            </div>
        </div>
    )
}

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    collectibles: ERC721TokenDetailed[]
    loading: boolean
    collectiblesRetry: () => void
    error: string | undefined
    readonly?: boolean
    hasRetry?: boolean
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const { provider, wallet, collectibles, loading, collectiblesRetry, error, readonly, hasRetry = true } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    useEffect(() => WalletMessages.events.erc721TokensUpdated.on(collectiblesRetry))

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {loading && (
                    <Box className={classes.root}>
                        {Array.from({ length: 3 })
                            .fill(0)
                            .map((_, i) => (
                                <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                                    <Skeleton animation="wave" variant="rectangular" width={172} height={172} />
                                    <Skeleton
                                        animation="wave"
                                        variant="text"
                                        width={172}
                                        height={20}
                                        style={{ marginTop: 4 }}
                                    />
                                </Box>
                            ))}
                    </Box>
                )}
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
                        {collectibles.map((x, i) => (
                            <CollectibleItem
                                renderOrder={i}
                                token={x}
                                provider={provider}
                                wallet={wallet}
                                readonly={readonly}
                                key={i}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListProps extends withClasses<'empty' | 'button'> {
    address: string
    collection?: string
    collectibles: ERC721TokenDetailed[]
    error?: string
    loading: boolean
    retry(): void
}

export function CollectibleList(props: CollectibleListProps) {
    const { address, collectibles, error, loading, retry } = props
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const classes = props.classes ?? {}

    return (
        <CollectibleListUI
            classes={classes}
            provider={provider}
            collectibles={collectibles}
            loading={loading}
            collectiblesRetry={retry}
            error={error}
            readonly
            hasRetry={!!address}
        />
    )
}

export function CollectionList({ address }: { address: string }) {
    const chainId = ChainId.Mainnet
    const { t } = useI18N()
    const { classes } = useStyles()

    const {
        data: collections,
        retry: retryFetchCollection,
        state: loadingCollectionDone,
    } = useCollections(address, chainId)
    const {
        data: collectibles,
        state: loadingCollectibleDone,
        retry: retryFetchCollectible,
    } = useCollectibles(address, chainId, !!collections.length)

    const isLoading = loadingCollectibleDone !== SocketState.done || loadingCollectionDone !== SocketState.done

    const renderWithRarible = useMemo(() => {
        if (isLoading) return []
        return collectibles.filter((item) => !item.collection)
    }, [collections?.length, collectibles?.length])

    if (loadingCollectionDone !== SocketState.done) {
        return (
            <Box className={classes.root}>
                {Array.from({ length: 3 })
                    .fill(0)
                    .map((_, i) => (
                        <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                            <Skeleton animation="wave" variant="rectangular" width={172} height={172} />
                            <Skeleton
                                animation="wave"
                                variant="text"
                                width={172}
                                height={20}
                                style={{ marginTop: 4 }}
                            />
                        </Box>
                    ))}
            </Box>
        )
    }

    if (!isLoading && !collections.length)
        return (
            <Box display="flex" alignItems="center" justifyContent="center">
                <Typography color="textPrimary" sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    {t('dashboard_no_collectible_found')}
                </Typography>
            </Box>
        )

    return (
        <Box>
            {(collections ?? []).map((x, i) => {
                const renderCollectibles = collectibles.filter(
                    (c) =>
                        isSameAddress(c.contractDetailed.address, x.address) ||
                        x.addresses?.find((r) => isSameAddress(r, c.contractDetailed.address)),
                )
                return (
                    <Box key={i}>
                        <Box display="flex" alignItems="center" sx={{ marginTop: '16px' }}>
                            <Box className={classes.collectionWrap}>
                                {x.iconURL ? (
                                    <Image component="img" className={classes.collectionImg} src={x.iconURL} />
                                ) : null}
                            </Box>
                            <Typography
                                className={classes.name}
                                color="textPrimary"
                                variant="body2"
                                sx={{ fontSize: '16px' }}>
                                {x.name}
                                {loadingCollectibleDone && renderCollectibles.length
                                    ? `(${renderCollectibles.length})`
                                    : null}
                            </Typography>
                        </Box>
                        <CollectibleList
                            address={address}
                            collection={x.slug}
                            retry={() => {
                                retryFetchCollectible()
                                retryFetchCollection()
                            }}
                            collectibles={renderCollectibles}
                            loading={loadingCollectibleDone !== SocketState.done && renderCollectibles.length === 0}
                        />
                    </Box>
                )
            })}
            {!!renderWithRarible.length && (
                <Box key="rarible">
                    <Box display="flex" alignItems="center" sx={{ marginTop: '16px' }}>
                        <Typography
                            className={classes.name}
                            color="textPrimary"
                            variant="body2"
                            sx={{ fontSize: '16px' }}>
                            Rarible ({renderWithRarible.length})
                        </Typography>
                    </Box>
                    <CollectibleList
                        address={address}
                        collection="Rarible"
                        retry={() => {
                            retryFetchCollectible()
                            retryFetchCollection()
                        }}
                        collectibles={renderWithRarible}
                        loading={false}
                    />
                </Box>
            )}
        </Box>
    )
}
