import { useValueRef } from '@masknet/shared'
import { EthereumTokenType, formatEthereumAddress, useAccount, Wallet } from '@masknet/web3-shared'
import { Box, Button, makeStyles, Skeleton, TablePagination, Typography } from '@material-ui/core'
import { createContext, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useCollectibles } from '../../../../plugins/Wallet/hooks/useCollectibles'
import { currentCollectibleDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    container: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
    },
    card: {
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

export interface CollectibleListProps {
    wallet: Wallet
}

export function CollectibleList(props: CollectibleListProps) {
    const { wallet } = props
    const { t } = useI18N()

    const classes = useStyles()
    const account = useAccount()

    const [page, setPage] = useState(0)
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const {
        value = { collectibles: [], hasNextPage: false },
        loading: collectiblesLoading,
        retry: collectiblesRetry,
        error: collectiblesError,
    } = useCollectibles(account, provider, page, 50)

    const { collectibles = [], hasNextPage } = value

    useUpdateEffect(() => {
        setPage(0)
    }, [account, provider])

    if (collectiblesLoading)
        return (
            <Box className={classes.root}>
                {new Array(4).fill(0).map((_, i) => (
                    <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                        <Skeleton animation="wave" variant="rectangular" width={160} height={220} />
                        <Skeleton animation="wave" variant="text" width={160} height={20} style={{ marginTop: 4 }} />
                    </Box>
                ))}
            </Box>
        )

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
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {collectiblesError || dataSource.length === 0 ? (
                    <Box
                        className={classes.root}
                        sx={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                        }}>
                        <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                        <Button
                            sx={{
                                marginTop: 1,
                            }}
                            variant="text"
                            onClick={() => collectiblesRetry()}>
                            {t('plugin_collectible_retry')}
                        </Button>
                    </Box>
                ) : (
                    <Box className={classes.root}>
                        {dataSource.map((x) => (
                            <div className={classes.card} key={x.tokenId}>
                                <CollectibleCard token={x} provider={provider} wallet={wallet} />
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
            {!(page === 0 && dataSource.length === 0) ? (
                <TablePagination
                    count={-1}
                    component="div"
                    onPageChange={() => {}}
                    page={page}
                    rowsPerPage={30}
                    rowsPerPageOptions={[30]}
                    labelDisplayedRows={() => null}
                    backIconButtonProps={{
                        onClick: () => setPage((prev) => prev - 1),
                        size: 'small',
                        disabled: page === 0,
                    }}
                    nextIconButtonProps={{
                        onClick: () => setPage((prev) => prev + 1),
                        disabled: !hasNextPage,
                        size: 'small',
                    }}
                />
            ) : null}
        </CollectibleContext.Provider>
    )
}
