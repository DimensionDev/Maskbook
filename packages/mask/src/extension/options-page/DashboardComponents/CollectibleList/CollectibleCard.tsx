import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'
import type { NonFungibleToken, SourceType, Wallet } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/src/entry-web3'
import { resolveOpenSeaLink } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px 8px 0 0',
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
    provider: SourceType
    wallet?: Wallet
    token: NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    readonly?: boolean
    renderOrder: number
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, readonly, renderOrder } = props
    const { classes } = useStyles()

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={resolveOpenSeaLink(token.address, token.tokenId)}
            className={classes.linkWrapper}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                <NFTCardStyledAssetPlayer
                    contractAddress={token.address}
                    chainId={token.chainId}
                    url={token.metadata?.mediaURL || token.metadata?.imageURL}
                    renderOrder={renderOrder}
                    tokenId={token.tokenId}
                    classes={{
                        loadingFailImage: classes.loadingFailImage,
                        wrapper: classes.wrapper,
                    }}
                    showNetwork
                />
            </Card>
        </Link>
    )
}
