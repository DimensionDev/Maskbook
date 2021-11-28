import { Card, CircularProgress, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    Wallet,
    useChainId,
    ERC721TokenDetailed,
    resolveCollectibleLink,
    CollectibleProvider,
} from '@masknet/web3-shared-evm'
import { MaskSharpIconOfSize } from '../../../../resources/MaskIcon'
import { ActionsBarNFT } from '../ActionsBarNFT'
import Services from '../../../service'
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
        width: 160,
        height: 220,
    },
}))

export interface CollectibleCardProps {
    provider: CollectibleProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly } = props
    const { classes } = useStyles()
    const chainId = useChainId()

    const { loading, value } = useAsyncRetry(async () => {
        if (!token.info.image) return

        const blob = await Services.Helper.fetch(token.info.image)
        const imgBase64 = (await blobToBase64(blob)) as string
        return { imgBlob: blob, imgBase64 }
    }, [token])

    const isVideo = !!value?.imgBase64.match(/^data:video/)?.[0]
    const isHtml = !!value?.imgBase64.match(/^data:text/)
    return (
        <>
            {loading ? (
                <CircularProgress />
            ) : (
                <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
                    <Card className={classes.root} style={{ width: 160, height: 220 }}>
                        {readonly || !wallet ? null : (
                            <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                        )}
                        {value ? (
                            isVideo ? (
                                <Video
                                    src={value.imgBlob}
                                    VideoProps={{ className: classes.video, autoPlay: true, loop: true }}
                                />
                            ) : isHtml ? (
                                <iframe src={token.info.image} />
                            ) : (
                                <Image
                                    component="img"
                                    width={160}
                                    height={220}
                                    style={{ objectFit: 'contain' }}
                                    src={value.imgBlob}
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

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}
