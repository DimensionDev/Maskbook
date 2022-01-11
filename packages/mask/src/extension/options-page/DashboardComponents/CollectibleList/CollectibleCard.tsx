import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Wallet, ERC721TokenDetailed, resolveCollectibleLink, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { MaskSharpIconOfSize } from '../../../../resources/MaskIcon'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        position: 'absolute',
        zIndex: 1,
        backgroundColor: theme.palette.background.default,
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
        width: 172,
        height: 172,
    },
}))

export interface CollectibleCardProps {
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly } = props
    const { classes } = useStyles()

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            className={classes.linkWrapper}
            href={resolveCollectibleLink(token.contractDetailed.chainId, provider, token)}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                {token.info.mediaUrl ? (
                    <NFTCardStyledAssetPlayer
                        contractAddress={token.contractDetailed.address}
                        chainId={token.contractDetailed.chainId}
                        url={token.info.mediaUrl}
                        tokenId={token.tokenId}
                        classes={{
                            loadingFailImage: classes.loadingFailImage,
                            wrapper: classes.wrapper,
                        }}
                    />
                ) : (
                    <MaskSharpIconOfSize classes={{ root: classes.placeholderIcon }} size={22} />
                )}
            </Card>
        </Link>
    )
}
