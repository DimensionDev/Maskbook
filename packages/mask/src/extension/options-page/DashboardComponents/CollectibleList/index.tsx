import { createContext, useState, useEffect, useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { useStylesExtends, useValueRef } from '@masknet/shared'
import { ChainId, CollectibleProvider, ERC721TokenDetailed, useCollectibles, Wallet } from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, TablePagination, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { currentCollectibleDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'
import { WalletMessages } from '../../../../plugins/Wallet/messages'
import { searchProfileTabSelector } from '../../../../social-network-adaptor/twitter.com/utils/selector'
import { Image } from '../../../../components/shared/Image'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
        textAlign: 'center',
        marginTop: theme.spacing(0.5),
        maxWidth: 160,
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
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
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        marginRight: '8px',
        background: 'rgba(229,232,235,1)',
    },
    collectionImg: {
        objectFit: 'contain',
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
                <Typography className={classes.name} color="textSecondary" variant="body2">
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
    hasNextPage: boolean
    readonly?: boolean
    page: number
    hasRetry?: boolean
    collectionView?: boolean
    onNextPage: () => void
    onPrevPage: () => void
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const {
        provider,
        wallet,
        collectibles,
        loading,
        hasNextPage,
        collectiblesRetry,
        error,
        readonly,
        page,
        hasRetry = true,
        collectionView = false,
        onNextPage,
        onPrevPage,
    } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const collections: ERC721TokenDetailed[][] = useMemo(() => {
        const collections: ERC721TokenDetailed[][] = []
        const addresses: string[] = []
        collectibles.forEach((item) => {
            const address = item.contractDetailed.address
            const index = addresses.indexOf(address)
            if (index !== -1) {
                collections[index].push(item)
            } else {
                addresses.push(address)
                collections.push([item])
            }
        })

        return collections
    }, [collectibles])

    WalletMessages.events.erc721TokensUpdated.on(collectiblesRetry)
    if (loading)
        return (
            <Box className={classes.root}>
                {Array.from({ length: 12 })
                    .fill(0)
                    .map((_, i) => (
                        <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                            <Skeleton animation="wave" variant="rectangular" width={160} height={220} />
                            <Skeleton
                                animation="wave"
                                variant="text"
                                width={160}
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
                ) : collectionView ? (
                    <Box>
                        {collections.map((x, i) => (
                            <Box key={i}>
                                <Box display="flex" alignItems="center" sx={{ marginTop: '24px' }}>
                                    <Box className={classes.collectionWrap}>
                                        {x[0].info.collection?.image ? (
                                            <Image
                                                component="img"
                                                className={classes.collectionImg}
                                                src={x[0].info.collection?.image}
                                            />
                                        ) : null}
                                    </Box>
                                    <Typography
                                        className={classes.name}
                                        color="textPrimary"
                                        variant="body2"
                                        sx={{ fontSize: '16px' }}>
                                        {x[0].info.collection?.name}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', overflow: 'auto' }}>
                                    {x.map((y, j) => (
                                        <CollectibleItem
                                            token={y}
                                            provider={provider}
                                            wallet={wallet}
                                            readonly={readonly}
                                            key={j}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ))}
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
            {!(page === 0 && collectibles.length === 0) ? (
                <TablePagination
                    count={-1}
                    component="div"
                    onPageChange={() => {}}
                    page={page}
                    rowsPerPage={30}
                    rowsPerPageOptions={[30]}
                    labelDisplayedRows={() => null}
                    backIconButtonProps={{
                        onClick: () => onPrevPage(),
                        size: 'small',
                        disabled: page === 0,
                    }}
                    nextIconButtonProps={{
                        onClick: () => onNextPage(),
                        disabled: !hasNextPage,
                        size: 'small',
                    }}
                />
            ) : null}
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListAddressProps extends withClasses<'empty' | 'button'> {
    address: string
    collectionView?: boolean
}

export function CollectibleListAddress(props: CollectibleListAddressProps) {
    const { address, collectionView } = props
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const chainId = ChainId.Mainnet
    const [page, setPage] = useState(0)
    const classes = props.classes ?? {}

    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        retry: collectiblesRetry,
        error: collectiblesError,
    } = useCollectibles(address, chainId, provider, page, 50)
    const { collectibles = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
    }, [provider, address])

    useEffect(() => {
        const tab = searchProfileTabSelector().evaluate()
        if (!tab) return
        tab.scrollIntoView()
    }, [page])

    return (
        <CollectibleListUI
            classes={classes}
            provider={provider}
            collectibles={collectibles}
            collectionView={collectionView}
            loading={collectiblesLoading}
            collectiblesRetry={collectiblesRetry}
            error={collectiblesError}
            readonly={true}
            page={page}
            hasNextPage={hasNextPage}
            hasRetry={!!address}
            onPrevPage={() => setPage((prev) => prev - 1)}
            onNextPage={() => setPage((next) => next + 1)}
        />
    )
}
