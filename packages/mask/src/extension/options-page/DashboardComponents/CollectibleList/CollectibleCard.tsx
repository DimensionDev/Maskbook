import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    Wallet,
    useChainId,
    ERC721TokenDetailed,
    resolveCollectibleLink,
    CollectibleProvider,
} from '@masknet/web3-shared-evm'
import { Image } from '../../../../components/shared/Image'
import { MaskSharpIconOfSize } from '../../../../resources/MaskIcon'
import { ActionsBarNFT } from '../ActionsBarNFT'
import { Video } from '../../../../components/shared/Video'

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
    provider: CollectibleProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly } = props
    const { classes } = useStyles()
    const chainId = useChainId()

    const isVideo = token.info.image?.match(/\.(mp4|webm|mov|ogg|mp3|wav)$/i)
    return (
        <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
            <Card className={classes.root} style={{ width: 172, height: 172, borderRadius: 0 }}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                {token.info.image ? (
                    isVideo ? (
                        <Video src={token.info.image} VideoProps={{ className: classes.video }} />
                    ) : (
                        <Image
                            component="img"
                            width={172}
                            height={172}
                            style={{ objectFit: 'cover' }}
                            src={token.info.image}
                        />
                    )
                ) : (
                    <MaskSharpIconOfSize classes={{ root: classes.placeholderIcon }} size={22} />
                )}
            </Card>
        </Link>
    )
}
