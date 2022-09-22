import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useWeb3State } from '@masknet/plugin-infra/web3'
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
    loadingPlaceholder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        padding: '74px 0',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100% !important',
        width: '100% !important',
        overflow: 'hidden',
        position: 'absolute',
    },

    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    iframe: {
        minWidth: 300,
        minHeight: 300,
        width: '100%',
        height: '100%',
        borderRadius: 20,
        background: '#000',
    },
    imgWrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 20,
        '& > img': {
            borderRadius: 20,
        },
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
        <div className={classes.layout}>
            <div className={classes.body}>
                <NFTCardStyledAssetPlayer
                    fallbackImage={fallbackImgURL}
                    url={resourceUrl}
                    classes={{
                        iframe: classes.iframe,
                        wrapper: classes.wrapper,
                        imgWrapper: classes.imgWrapper,
                        loadingPlaceholder: classes.loadingPlaceholder,
                        fallbackImage: classes.fallbackImage,
                    }}
                    isImageOnly={false}
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
