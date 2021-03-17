import { Box, Button, makeStyles, Skeleton, Typography } from '@material-ui/core'
import { CollectibleCard } from './CollectibleCard'
import { useCollectibles } from '../../../../plugins/Wallet/hooks/useCollectibles'
import { AssetProvider } from '../../../../plugins/Wallet/types'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { createERC721Token } from '../../../../web3/helpers'
import type { WalletRecord } from '../../../../plugins/Wallet/database/types'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { formatEthereumAddress } from '../../../../plugins/Wallet/formatter'
import { createContext } from 'react'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

export interface CollectibleListProps {
    wallet: WalletRecord
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
}))

export function CollectibleList(props: CollectibleListProps) {
    const { wallet } = props

    const account = useAccount()
    const chainId = useChainId()
    const classes = useStyles()
    const {
        value: collectibles = [],
        loading: collectiblesLoading,
        error: collectiblesError,
        retry: collectiblesRetry,
    } = useCollectibles(account, AssetProvider.OPENSEAN)

    if (collectiblesLoading)
        return (
            <Box className={classes.root}>
                {new Array(3).fill(0).map((_, i) => (
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

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.root}>
                {collectibles
                    .filter(
                        (x) =>
                            !wallet.erc721_token_blacklist.has(
                                `${formatEthereumAddress(x.asset_contract.address)}_${x.token_id}`,
                            ),
                    )
                    .map((y) => (
                        <div className={classes.card} key={y.id}>
                            <CollectibleCard
                                key={y.id}
                                wallet={wallet}
                                token={createERC721Token(
                                    chainId,
                                    y.token_id,
                                    y.asset_contract.address,
                                    y.name,
                                    y.asset_contract.symbol,
                                    '',
                                    y.image_url ?? y.image_preview_url ?? '',
                                )}
                                link={y.permalink}
                            />
                            <div className={classes.description}>
                                <Typography color="textSecondary" variant="body2">
                                    {y.name ?? y.collection.slug}
                                </Typography>
                            </div>
                        </div>
                    ))}
            </Box>
        </CollectibleContext.Provider>
    )
}
