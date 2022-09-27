import { AssetPreviewer } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    layout: {
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
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
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
    absoluteProvider: {
        top: 16,
        right: '5%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 99,
    },
    providerIcon: {
        cursor: 'pointer',
    },
    fallbackImage: {
        width: '100% !important',
        height: '100% !important',
        position: 'absolute',
    },
    unset: {
        color: 'unset',
    },
}))

export interface FigureCardProps {
    timeline?: boolean
    hideSubtitle?: boolean
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID>
}

export function FigureCard(props: FigureCardProps) {
    const { asset, hideSubtitle, timeline } = props
    const { classes, cx } = useStyles()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()

    const fallbackImgURL = new URL('../../assets/FallbackImage.svg', import.meta.url)
    const resourceUrl = asset.metadata?.imageURL ?? asset.metadata?.mediaURL

    return (
        <div className={classes.layout}>
            <div className={classes.body}>
                <AssetPreviewer
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                    pluginID={pluginID}
                    chainId={asset.chainId}
                    url={resourceUrl}
                    fallbackImage={fallbackImgURL}
                />
            </div>
            <Typography className={timeline ? cx(classes.nameSm, classes.unset) : classes.nameSm}>
                {asset.metadata?.name ?? '-'}
                {Others?.formatTokenId(asset.tokenId)}
            </Typography>
            {!hideSubtitle && (
                <div className={classes.nameLgBox}>
                    <Typography className={classes.nameLg}>{asset.collection?.name}</Typography>
                    {asset.collection?.verified && <VerifiedUserIcon color="primary" fontSize="small" />}
                </div>
            )}
        </div>
    )
}
