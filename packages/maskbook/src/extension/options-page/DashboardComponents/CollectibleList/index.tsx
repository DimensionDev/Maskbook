import { createContext, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useStylesExtends, useValueRef } from '@masknet/shared'
import {
    ChainId,
    CollectibleProvider,
    ERC1155TokenAssetDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
    Wallet,
} from '@masknet/web3-shared'
import { Box, Button, makeStyles, Skeleton, TablePagination, Typography } from '@material-ui/core'
import { currentCollectibleDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const useStyles = makeStyles((theme) => ({
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
}))

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: CollectibleProvider
    wallet?: Wallet
    collectibles: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]
    loading: boolean
    collectiblesRetry: () => void
    error: Error | undefined
    hasNextPage: boolean
    readonly?: boolean
    page: number
    hasRetry?: boolean
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
        onNextPage,
        onPrevPage,
    } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    if (loading)
        return (
            <Box className={classes.root}>
                {Array.from({ length: 6 })
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
                ) : (
                    <Box className={classes.root}>
                        {collectibles.map((x) => (
                            <div className={classes.card} key={x.tokenId}>
                                <CollectibleCard token={x} provider={provider} wallet={wallet} readonly={readonly} />
                                <div className={classes.description}>
                                    <Typography className={classes.name} color="textSecondary" variant="body2">
                                        {x.asset?.name ?? x.name}
                                    </Typography>
                                </div>
                            </div>
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
}

export function CollectibleListAddress(props: CollectibleListAddressProps) {
    const { address } = props
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

    return (
        <CollectibleListUI
            classes={classes}
            provider={provider}
            collectibles={collectibles}
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

export interface CollectibleListProps {
    wallet: Wallet
    readonly?: boolean
}

export function CollectibleList({ wallet, readonly }: CollectibleListProps) {
    const account = useAccount()
    const chainId = useChainId()
    const [page, setPage] = useState(0)
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        retry: collectiblesRetry,
        error: collectiblesError,
    } = useCollectibles(account, chainId, provider, page, 50)

    const { collectibles = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
    }, [account, provider])

    const dataSource = collectibles.filter((x) => {
        const key = `${formatEthereumAddress(x.address)}_${x.tokenId}`
        switch (x.type) {
            case EthereumTokenType.ERC721:
                return wallet.erc721_token_blacklist ? !wallet.erc721_token_blacklist.has(key) : true
            case EthereumTokenType.ERC1155:
                return wallet.erc1155_token_blacklist ? !wallet.erc1155_token_blacklist.has(key) : true
            default:
                return false
        }
    })

    return (
        <CollectibleListUI
            provider={provider}
            wallet={wallet}
            collectibles={dataSource}
            loading={collectiblesLoading}
            error={collectiblesError}
            collectiblesRetry={collectiblesRetry}
            hasNextPage={hasNextPage}
            readonly={readonly}
            page={page}
            onPrevPage={() => setPage((prev) => prev - 1)}
            onNextPage={() => setPage((prev) => prev + 1)}
        />
    )
}
