import { AssetPreviewer, NFTFallbackImage } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'

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
        boxShadow: `0px 28px 56px -28px ${MaskColorVar.primary.alpha(0.5)}`,
        borderRadius: 20,
        overflow: 'hidden',
    },
    previewer: {
        inset: 0,
        margin: 'auto',
        position: 'absolute',
    },
    nameSm: {
        marginTop: 36,
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    nameLg: {
        fontSize: 18,
        fontWeight: 700,
        wordBreak: 'break-word',
        alignItems: 'center',
    },
    nameLgBox: {
        display: 'flex',
        placeSelf: 'center',
        gap: 6,
        marginTop: 12,
    },
    image: {},
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
    asset: Web3Helper.NonFungibleAssetScope
}

export function FigureCard(props: FigureCardProps) {
    // TODO: the collection name maybe is wrong
    const { asset, hideSubTitle, timeline } = props
    const { classes, cx } = useStyles()

    return (
        <div className={classes.root}>
            <div className={classes.body}>
                <div className={classes.previewer}>
                    <AssetPreviewer
                        classes={{
                            root: classes.image,
                            fallbackImage: classes.fallbackImage,
                        }}
                        url={asset.metadata?.imageURL}
                        fallbackImage={NFTFallbackImage}
                    />
                </div>
            </div>

            <Typography className={timeline ? cx(classes.nameSm, classes.unset) : classes.nameSm}>
                {asset.metadata?.name ?? '-'}
            </Typography>

            {!hideSubTitle && (
                <div className={classes.nameLgBox}>
                    <Typography className={classes.nameLg}>
                        {asset.collection?.name}
                        {asset.collection?.verified ? (
                            <Icons.Verification style={{ transform: 'translate(4px, 5px)' }} />
                        ) : null}
                    </Typography>
                </div>
            )}
        </div>
    )
}
