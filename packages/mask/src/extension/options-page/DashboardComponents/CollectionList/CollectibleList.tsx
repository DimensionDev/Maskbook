import { createContext, useState, useEffect } from 'react'
import { useUpdateEffect } from 'react-use'
import { useValueRef } from '@masknet/shared'
import {
    ChainId,
    NonFungibleAssetProvider,
    ERC721TokenDetailed,
    useCollectibles,
    Wallet,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { currentNonFungibleAssetDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleItem } from './CollectibleItem'
import { WalletMessages } from '../../../../plugins/Wallet/messages'

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
interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: NonFungibleAssetProvider
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

    useEffect(() => WalletMessages.events.erc721TokensUpdated.on(collectiblesRetry))

    if (loading)
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
                                key={i}
                                token={x}
                                provider={provider}
                                wallet={wallet}
                                readonly={readonly}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListProps extends withClasses<'empty' | 'button'> {
    chainId: ChainId
    address: string
    collection?: string
    setCount: (count: number) => void
}

export function CollectibleList(props: CollectibleListProps) {
    const { chainId, address, collection, setCount } = props
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const [page, setPage] = useState(0)
    const classes = props.classes ?? {}

    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        retry: collectiblesRetry,
        error: collectiblesError,
    } = useCollectibles(chainId, address, provider, page, 50, collection)
    const { collectibles = [], hasNextPage } = value
    const [rendCollectibles, setRendCollectibles] = useState<ERC721TokenDetailed[]>([])

    useUpdateEffect(() => {
        setPage(0)
    }, [provider, address])

    useEffect(() => {
        if (!collectibles.length) return
        setRendCollectibles([...rendCollectibles, ...collectibles])
        if (!hasNextPage) return
        const timer = setTimeout(() => {
            setPage(page + 1)
        }, 1000)
        return () => {
            clearTimeout(timer)
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
