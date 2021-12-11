import { Card, CircularProgress, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    Wallet,
    useChainId,
    ERC721TokenDetailed,
    resolveCollectibleLink,
    NonFungibleAssetProvider,
} from '@masknet/web3-shared-evm'
import { MaskSharpIconOfSize } from '../../../../resources/MaskIcon'
import { ActionsBarNFT } from '../ActionsBarNFT'
import { useAsyncRetry } from 'react-use'
import { Video } from '../../../../components/shared/Video'
import { Image } from '../../../../components/shared/Image'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
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
    video: {
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

const videoTypeRe = /\.(mp4|mp3|m4v|ogg)$/i
const videoMimeRe = /^video/
const htmlMimeRe = /^text/
export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly } = props
    const { classes } = useStyles()
    const chainId = useChainId()

    const mediaUrl = token.info.mediaUrl
    const { loading, value } = useAsyncRetry(async () => {
        if (!mediaUrl) return

        const blob = await (await fetch(mediaUrl)).blob()
        return blob
    }, [mediaUrl])

    const mimeType = value?.type || ''
    // some video resources response content-type not video, e.g. application/octet-stream
    const isVideo = mediaUrl ? videoTypeRe.test(mediaUrl) || mimeType.startsWith('video') : undefined
    const isHtml = mimeType.startsWith('text')

    return (
        <>
            {loading ? (
                <CircularProgress />
            ) : (
                <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
                    <Card className={classes.root} style={{ width: 172, height: 172 }}>
                        {readonly || !wallet ? null : (
                            <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                        )}
                        {token.info.mediaUrl ? (
                            isVideo ? (
                                <Video
                                    src={value ?? token.info.mediaUrl}
                                    VideoProps={{ className: classes.video, autoPlay: true, loop: true }}
                                />
                            ) : isHtml ? (
                                <iframe src={token.info.mediaUrl} />
                            ) : (
                                <Image
                                    component="img"
                                    width={172}
                                    height={172}
                                    style={{ objectFit: 'cover' }}
                                    src={value ?? token.info.mediaUrl}
                                />
                            )
                        ) : (
                            <MaskSharpIconOfSize classes={{ root: classes.placeholderIcon }} size={22} />
                        )}
                    </Card>
                </Link>
            )}
        </>
    )
}
