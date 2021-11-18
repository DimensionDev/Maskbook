import { createContext, useState, useEffect } from 'react'
import { useUpdateEffect } from 'react-use'
import { useStylesExtends, useValueRef } from '@masknet/shared'
import {
    ChainId,
    CollectibleProvider,
    ERC721TokenCollectionInfo,
    ERC721TokenDetailed,
    useCollectibles,
    useCollections,
    Wallet,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { currentCollectibleDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'
import { WalletMessages } from '../../../../plugins/Wallet/messages'
import { Image } from '../../../../components/shared/Image'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
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
        marginRight: '8px',
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
    provider: CollectibleProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
}

function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, token, readonly } = props
    const { classes } = useStyles()
    return (
        <div className={classes.card}>
            <CollectibleCard token={token} provider={provider} wallet={wallet} readonly={readonly} />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.info.name}
                </Typography>
            </div>
        </div>
    )
}

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: CollectibleProvider
    wallet?: Wallet
    collectibles: ERC721TokenDetailed[]
    loading: boolean
    collectiblesRetry: () => void
    error: Error | undefined
    readonly?: boolean
    hasRetry?: boolean
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const { provider, wallet, collectibles, loading, collectiblesRetry, error, readonly, hasRetry = true } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    WalletMessages.events.erc721TokensUpdated.on(collectiblesRetry)
    if (loading)
        return (
            <Box className={classes.root}>
                {Array.from({ length: 3 })
                    .fill(0)
                    .map((_, i) => (
                        <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                            <Skeleton animation="wave" variant="rectangular" width={180} height={180} />
                            <Skeleton
                                animation="wave"
                                variant="text"
                                width={180}
                                height={20}
                                style={{ marginTop: 4 }}
                            />
                        </Box>
                    ))}
            </Box>
        )

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {error || collectibles.length === 0 ? (
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

export interface CollectibleListAddressProps extends withClasses<'empty' | 'button'> {
    address: string
    collection?: string
    setCount: (count: number) => void
}

export function CollectibleListAddress(props: CollectibleListAddressProps) {
    const { address, collection, setCount } = props
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const chainId = ChainId.Mainnet
    const [page, setPage] = useState(0)
    const classes = props.classes ?? {}

    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        retry: collectiblesRetry,
        error: collectiblesError,
    } = useCollectibles(address, chainId, provider, page, 50, collection)
    const { collectibles = [], hasNextPage } = value
    const [rendCollectibles, setRendCollectibles] = useState<ERC721TokenDetailed[]>([])

    useUpdateEffect(() => {
        setPage(0)
    }, [provider, address])

    useEffect(() => {
        if (collectibles.length) {
            setRendCollectibles([...rendCollectibles, ...collectibles])
            if (hasNextPage) {
                setTimeout(() => {
                    setPage(page + 1)
                }, 1000)
            }
        }
    }, [collectibles])

    useEffect(() => {
        setCount(rendCollectibles.length)
    }, [rendCollectibles])

    return (
        <CollectibleListUI
            classes={classes}
            provider={provider}
            collectibles={collectibles}
            loading={collectiblesLoading}
            collectiblesRetry={collectiblesRetry}
            error={collectiblesError}
            readonly={true}
            hasRetry={!!address}
        />
    )
}

export function CollectionList({ address }: { address: string }) {
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const chainId = ChainId.Mainnet
    const [page, setPage] = useState(0)
    const { classes } = useStyles()
    const [counts, setCounts] = useState<number[]>([])
    const [rendCollections, setRendCollections] = useState<ERC721TokenCollectionInfo[]>([])

    const { value = { collections: [], hasNextPage: false } } = useCollections(address, chainId, provider, page, 3)
    const { collections = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
    }, [provider, address])

    useEffect(() => {
        if (collections.length) {
            setRendCollections([...rendCollections, ...collections])
            if (hasNextPage) {
                setTimeout(() => {
                    setPage(page + 1)
                }, 3000)
            }
        }
    }, [collections])

    return (
        <Box>
            {rendCollections.map((x, i) => (
                <Box key={i}>
                    <Box display="flex" alignItems="center" sx={{ marginTop: '16px' }}>
                        <Box className={classes.collectionWrap}>
                            {x.image ? <Image component="img" className={classes.collectionImg} src={x.image} /> : null}
                        </Box>
                        <Typography
                            className={classes.name}
                            color="textPrimary"
                            variant="body2"
                            sx={{ fontSize: '16px' }}>
                            {x.name}({counts[i]})
                        </Typography>
                    </Box>
                    <CollectibleListAddress
                        address={address}
                        collection={x.slug}
                        setCount={(count) => {
                            counts[i] = count
                            setCounts(counts)
                        }}
                    />
                </Box>
            ))}
        </Box>
    )
}
