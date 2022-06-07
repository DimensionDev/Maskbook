import { Card, Link, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Wallet, NonFungibleAssetProvider, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'
import type { NonFungibleToken } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        position: 'absolute',
        zIndex: 1,
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        width: 172,
        height: 172,
    },
    icon: {
        top: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
        zIndex: 1,
        backgroundColor: `${theme.palette.background.paper} !important`,
    },
    placeholderIcon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 64,
        height: 64,
        opacity: 0.1,
    },
    loadingFailImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 64,
        height: 64,
    },
    wrapper: {
        width: '172px !important',
        height: '172px !important',
    },
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: 172,
        height: 172,
    },
    linkWrapper: {
        position: 'relative',
        display: 'block',
        width: 172,
        height: 172,
    },
}))

export interface CollectibleCardProps {
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    token: NonFungibleToken<ChainId, SchemaType>
    readonly?: boolean
    renderOrder: number
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly, renderOrder } = props
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <Link target="_blank" rel="noopener noreferrer" className={classes.linkWrapper}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                <NFTCardStyledAssetPlayer
                    contractAddress={token.address}
                    chainId={token.chainId}
                    url={token.metadata?.mediaURL}
                    renderOrder={renderOrder}
                    tokenId={token.tokenId}
                    classes={{
                        loadingFailImage: classes.loadingFailImage,
                        wrapper: classes.wrapper,
                    }}
                />
            </Card>
        </Link>
    )
}
