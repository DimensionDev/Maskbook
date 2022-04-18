import { Card, Link, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'
import { useWeb3State, Web3Plugin } from '@masknet/plugin-infra/web3'

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
        minHeight: '0px !important',
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
    wallet?: Web3Plugin.Wallet
    token: Web3Plugin.NonFungibleAsset
    readonly?: boolean
    renderOrder: number
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, readonly, renderOrder } = props
    const { Utils } = useWeb3State() ?? {}

    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            className={classes.linkWrapper}
            href={Utils?.resolveNonFungibleTokenLink?.(token.chainId, token.address, token.tokenId) ?? '#'}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                <NFTCardStyledAssetPlayer
                    contractAddress={token.contract?.address}
                    chainId={token.contract?.chainId}
                    url={token?.metadata?.mediaURL}
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
