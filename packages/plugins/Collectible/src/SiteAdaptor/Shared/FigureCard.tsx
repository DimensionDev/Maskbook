import { AssetPreviewer, NFTFallbackImage, NFTSpamBadge, useReportSpam } from '@masknet/shared'
import { LoadingBase, makeStyles, MaskColorVar, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { Box, IconButton, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
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
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        marginRight: 'auto',
    },
    nameLg: {
        fontSize: 18,
        fontWeight: 700,
        wordBreak: 'break-word',
        alignItems: 'center',
        marginRight: 'auto',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    nameLgBox: {
        display: 'flex',
        gap: 6,
        marginTop: 12,
        alignItems: 'center',
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
    reportButton: {
        color: theme.palette.maskColor.main,
        height: 20,
        width: 20,
        padding: 0,
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 7,
    },
}))

interface FigureCardProps {
    hideSubTitle?: boolean
    timeline?: boolean
    asset: Web3Helper.NonFungibleAssetScope
}

export function FigureCard(props: FigureCardProps) {
    // TODO: the collection name maybe is wrong
    const { asset, hideSubTitle, timeline } = props
    const { classes, cx } = useStyles()
    const { pluginID } = Context.useContainer()
    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: asset.address,
        chainId: asset.chainId,
        collectionId: asset.collection?.id,
        pluginID,
    })

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

            <Box display="flex" alignItems="center" mt={4}>
                <TextOverflowTooltip title={asset.metadata?.name} as={ShadowRootTooltip}>
                    <Typography className={timeline ? cx(classes.nameSm, classes.unset) : classes.nameSm}>
                        {asset.metadata?.name ?? '-'}
                    </Typography>
                </TextOverflowTooltip>
            </Box>

            {!hideSubTitle && (
                <div className={classes.nameLgBox}>
                    <TextOverflowTooltip title={asset.collection?.name} as={ShadowRootTooltip}>
                        <Typography className={classes.nameLg}>{asset.collection?.name}</Typography>
                    </TextOverflowTooltip>
                    {asset.collection?.verified ?
                        <Icons.Verification />
                    :   null}

                    {isSpam ?
                        <NFTSpamBadge ml="7px" />
                    :   <IconButton className={classes.reportButton} onClick={promptReport} disabled={isReporting}>
                            {isReporting ?
                                <LoadingBase size={20} />
                            :   <Icons.Flag size={20} />}
                        </IconButton>
                    }
                </div>
            )}
        </div>
    )
}
