import { Card, Link, makeStyles } from '@material-ui/core'
import {
    Wallet,
    useChainId,
    ERC1155TokenAssetDetailed,
    ERC721TokenAssetDetailed,
    resolveCollectibleLink,
    CollectibleProvider,
} from '@masknet/web3-shared'
import { Image } from '../../../../components/shared/Image'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'
import { ActionsBarNFT } from '../ActionsBarNFT'
import { Video } from '../../../../components/shared/Video'

const useStyles = makeStyles((theme) => ({
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
    placeholder: {
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
    token: ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed
    readonly?: boolean
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, token, provider, readonly } = props
    const classes = useStyles(props)
    const chainId = useChainId()

    const isVideo = token.asset?.image?.match(/\.(mp4|webm|mov|ogg|mp3|wav)$/i)

    return (
        <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
            <Card className={classes.root} style={{ width: 160, height: 220 }}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} token={token} />
                )}
                {token.asset?.image ? (
                    isVideo ? (
                        <Video src={token.asset.image} VideoProps={{ className: classes.video }} />
                    ) : (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={token.asset.image}
                        />
                    )
                ) : (
                    <MaskbookIconOutlined className={classes.placeholder} />
                )}
            </Card>
        </Link>
    )
}
