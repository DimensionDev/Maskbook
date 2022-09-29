import { AssetPreviewer } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    body: {
        position: 'relative',
        width: 510,
        height: 510,
        marginBottom: 36,
        boxShadow: `0px 28px 56px -28px ${MaskColorVar.primary.alpha(0.5)}`,
        borderRadius: 20,
        alignItems: 'center',
    },
    nameSm: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
    },
    nameLg: {
        fontSize: 20,
        fontWeight: 700,
    },
    nameLgBox: {
        display: 'flex',
        placeSelf: 'center',
        gap: 6,
        marginTop: 12,
    },
    image: {
        height: 'auto !important',
    },
    fallbackImage: {
        width: '100% !important',
        height: '100% !important',
        top: 0,
        position: 'absolute',
    },
    unset: {
        color: 'unset',
    },
}))

export interface FigureCardProps {
    hideSubTitle?: boolean
    timeline?: boolean
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID>
}

export function FigureCard(props: FigureCardProps) {
    const { asset, hideSubTitle, timeline } = props
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()

    const fallbackImgURL = new URL('../../assets/FallbackImage.svg', import.meta.url)
    const resourceUrl = asset.metadata?.imageURL ?? asset.metadata?.mediaURL
    return (
        <div className={classes.root}>
            <div className={classes.body}>
                <AssetPreviewer
                    fallbackImage={fallbackImgURL}
                    url={resourceUrl}
                    classes={{
                        root: classes.image,
                        fallbackImage: classes.fallbackImage,
                    }}
                />
            </div>
            <Typography className={timeline ? cx(classes.nameSm, classes.unset) : classes.nameSm}>
                {asset.metadata?.name ?? '-'}
                {Others?.formatTokenId(asset.tokenId)}
            </Typography>
            {!hideSubTitle && (
                <div className={classes.nameLgBox}>
                    <Typography className={classes.nameLg}>{asset.collection?.name}</Typography>
                    {asset.collection?.verified && <VerifiedUserIcon color="primary" fontSize="small" />}
                </div>
            )}
        </div>
    )
}
