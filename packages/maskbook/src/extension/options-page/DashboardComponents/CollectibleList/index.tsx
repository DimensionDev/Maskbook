import { Box, Button, CircularProgress, makeStyles, Skeleton, Typography } from '@material-ui/core'
import { CollectibleCard } from './CollectibleCard'
import { createERC1155Token, createERC721Token } from '../../../../web3/helpers'
import type { WalletRecord } from '../../../../plugins/Wallet/database/types'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { formatEthereumAddress } from '../../../../plugins/Wallet/formatter'
import { createContext } from 'react'
import type { Collectible } from '../../../../plugins/Wallet/types'
import AutoResize from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

export interface CollectibleListProps {
    wallet: WalletRecord
    collectibles: Collectible[]
    collectiblesLoading: boolean
    collectiblesError: Error | undefined
    collectiblesRetry: () => void
    onNextPage: () => void
    page: number
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
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
    loading: {
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
}))

export function CollectibleList(props: CollectibleListProps) {
    const chainId = useChainId()
    const classes = useStyles()
    const { wallet, collectibles, collectiblesLoading, collectiblesError, collectiblesRetry, onNextPage, page } = props

    if (collectiblesLoading && page === 1)
        return (
            <Box className={classes.root}>
                {new Array(4).fill(0).map((_, i) => (
                    <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                        <Skeleton animation="wave" variant="rectangular" width={160} height={220}></Skeleton>
                        <Skeleton
                            animation="wave"
                            variant="text"
                            width={160}
                            height={20}
                            style={{ marginTop: 4 }}></Skeleton>
                    </Box>
                ))}
            </Box>
        )

    if (collectiblesError || collectibles.length === 0)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No collectible found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => collectiblesRetry()}>
                    Retry
                </Button>
            </Box>
        )

    const dataSource = collectibles.filter((x) => {
        const key = `${formatEthereumAddress(x.asset_contract.address)}_${x.token_id}`
        switch (x.asset_contract.schema_name) {
            case 'ERC721':
                return wallet.erc721_token_blacklist ? !wallet.erc721_token_blacklist.has(key) : true
            case 'ERC1155':
                return wallet.erc1155_token_blacklist ? !wallet.erc1155_token_blacklist.has(key) : true
            default:
                return false
        }
    })

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <AutoResize>
                {({ width, height }) => {
                    return (
                        <FixedSizeGrid
                            columnWidth={176}
                            rowHeight={260}
                            columnCount={4}
                            height={height - 40}
                            onItemsRendered={({
                                overscanRowStopIndex,
                                overscanColumnStopIndex,
                                visibleRowStopIndex,
                                visibleColumnStopIndex,
                            }) => {
                                if (dataSource.length === 0 || collectiblesError || collectiblesLoading) return
                                if (
                                    visibleColumnStopIndex === overscanColumnStopIndex &&
                                    visibleRowStopIndex === overscanRowStopIndex &&
                                    visibleRowStopIndex === Math.ceil(dataSource.length / 4) - 1
                                ) {
                                    onNextPage()
                                }
                            }}
                            rowCount={Math.ceil(dataSource.length / 4)}
                            width={width}>
                            {({ columnIndex, rowIndex, style }) => {
                                const y = dataSource[rowIndex * 4 + columnIndex]
                                if (y) {
                                    return (
                                        <div className={classes.card} key={y.token_id} style={style}>
                                            <CollectibleCard
                                                wallet={wallet}
                                                token={
                                                    y.asset_contract.schema_name === 'ERC721'
                                                        ? createERC721Token(
                                                              chainId,
                                                              y.token_id,
                                                              y.asset_contract.address,
                                                              y.name,
                                                              y.asset_contract.symbol,
                                                              '',
                                                              '',
                                                              y.image,
                                                          )
                                                        : createERC1155Token(
                                                              chainId,
                                                              y.token_id,
                                                              y.asset_contract.address,
                                                              y.name,
                                                              y.image,
                                                          )
                                                }
                                                link={y.permalink}
                                            />
                                            <div className={classes.description}>
                                                <Typography color="textSecondary" variant="body2">
                                                    {y.name}
                                                </Typography>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        </FixedSizeGrid>
                    )
                }}
            </AutoResize>
            {collectiblesLoading && (
                <Box className={classes.loading}>
                    <CircularProgress size={25} />
                </Box>
            )}
        </CollectibleContext.Provider>
    )
}
