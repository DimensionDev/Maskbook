import { AssetPreviewer } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Context } from '../Context/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    body: {
        position: 'relative',
        width: '100%',
        height: 0,
        paddingBottom: '100%',
        marginBottom: 36,
        boxShadow: `0px 28px 56px -28px ${MaskColorVar.primary.alpha(0.5)}`,
        borderRadius: 20,
        overflow: 'hidden',
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
    const { pluginID } = Context.useContainer()
    const { Others } = useWeb3State()

    return (
        <div className={classes.root}>
            <div className={classes.body}>
                <AssetPreviewer
                    classes={{
                        root: classes.image,
                        fallbackImage: classes.fallbackImage,
                    }}
                    url={asset.metadata?.imageURL}
                    fallbackImage={new URL('../../assets/FallbackImage.svg', import.meta.url)}
                />
            </div>
            <Typography className={timeline ? cx(classes.nameSm, classes.unset) : classes.nameSm}>
                {asset.metadata?.name ?? '-'}
                {pluginID !== NetworkPluginID.PLUGIN_SOLANA ? Others?.formatTokenId(asset.tokenId) : null}
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
