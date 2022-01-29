import { Card, Link, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    Wallet,
    ERC721TokenDetailed,
    resolveCollectibleLink,
    NonFungibleAssetProvider,
    useImageChecker,
} from '@masknet/web3-shared-evm'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'
import { Image } from '../../../../components/shared/Image'

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
    renderOrder: number
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly, renderOrder } = props
    const { classes } = useStyles()
    const theme = useTheme()
    const fallbackImageURL =
        theme.palette.mode === 'dark'
            ? new URL('./nft_token_fallback_dark.png', import.meta.url)
            : new URL('./nft_token_fallback.png', import.meta.url)
    const { value: isImageToken, loading } = useImageChecker(token.info.mediaUrl)
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
                    loading ? (
                        <Image component="img" width={172} height={172} loading src="" />
                    ) : isImageToken ? (
                        <Image
                            component="img"
                            width={172}
                            height={172}
                            style={{ objectFit: 'cover' }}
                            src={token.info.mediaUrl}
                            onError={(event) => {
                                const target = event.currentTarget as HTMLImageElement
                                target.src = fallbackImageURL.toString()
                                target.classList.add(classes.loadingFailImage ?? '')
                            }}
                        />
                    ) : (
                        <NFTCardStyledAssetPlayer
                            contractAddress={token.contractDetailed.address}
                            chainId={token.contractDetailed.chainId}
                            url={token.info.mediaUrl}
                            renderOrder={renderOrder}
                            tokenId={token.tokenId}
                            fallbackResourceLoader={
                                <Image
                                    component="img"
                                    width={172}
                                    height={172}
                                    style={{ objectFit: 'cover' }}
                                    src={token.info.imageURL ?? ''}
                                    onError={(event) => {
                                        const target = event.currentTarget as HTMLImageElement
                                        target.src = fallbackImageURL.toString()
                                        target.classList.add(classes.loadingFailImage ?? '')
                                    }}
                                />
                            }
                            classes={{
                                loadingFailImage: classes.loadingFailImage,
                                wrapper: classes.wrapper,
                            }}
                        />
                    )
                ) : (
                    <Image
                        component="img"
                        width={172}
                        height={172}
                        style={{ objectFit: 'cover' }}
                        src={fallbackImageURL.toString()}
                        className={classes.loadingFailImage}
                    />
                )}
            </Card>
        </Link>
    )
}
