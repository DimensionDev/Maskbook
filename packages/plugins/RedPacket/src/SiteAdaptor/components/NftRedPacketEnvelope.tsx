import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Image, NetworkIcon, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworks } from '@masknet/web3-hooks-base'
import { isZero, type NonFungibleAsset } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { HTMLProps } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        borderRadius: 16,
        position: 'relative',
    },
    cover: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    label: {
        position: 'absolute',
        pointerEvents: 'none',
        width: 48,
        height: 48,
        top: 0,
        left: 0,
        zIndex: 9,
    },
    content: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.30) 100%)',
        paddingBottom: theme.spacing(2),
        boxSizing: 'border-box',
    },
    message: {
        height: 72,
        borderRadius: theme.spacing(2, 2, 0, 0),
        padding: theme.spacing(1.5, 1.5, 1.5, 6),
        color: theme.palette.maskColor.white,
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.10) 0%, rgba(102, 102, 102, 0.10) 100%)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '24px',
        wordBreak: 'break-all',
        whiteSpace: 'normal',
        alignItems: 'center',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
    },
    asset: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginTop: 'auto',
    },
    assetCard: {
        display: 'flex',
        width: 90,
        borderRadius: 8,
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        boxShadow: '0px 6px 12px 0px rgba(28, 104, 243, 0.20)',
        position: 'relative',
    },
    badgeIcon: {
        position: 'absolute',
        top: 3,
        left: 3,
    },
    assetImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        objectFit: 'cover',
    },
    assetInfo: {
        padding: theme.spacing(0.5),
        width: '100%',
        boxSizing: 'border-box',
    },
    collectionName: {
        color: theme.palette.maskColor.white,
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    assetId: {
        fontWeight: 700,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    amount: {
        color: theme.palette.maskColor.white,
        textAlign: 'center',
        fontFamily: 'Helvetica',
        fontSize: '24px',
        fontWeight: 700,
        lineHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    status: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing('2px', 1),
        gap: theme.spacing(0.5),
        color: theme.palette.maskColor.white,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '16px',
        borderRadius: 8,
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    statusText: {
        fontWeight: 700,
    },
    bar: {
        width: 80,
        height: 9,
        borderRadius: 999,
        position: 'relative',
        overflow: 'hidden',
    },
    outline: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 999,
        border: '1px solid  rgba(255, 255, 255, 0.28)',
    },
    progress: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        '&[data-fulfilled]': {
            borderRadius: '999px',
        },
    },
    creator: {
        marginTop: theme.spacing(2),
        color: theme.palette.maskColor.white,
        textAlign: 'center',
        fontFamily: 'Helvetica',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    cover: string
    message: string
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    shares?: number
    /** claimed entities */
    claimedCount: number
    total: number
    isClaimed?: boolean
    isEmpty?: boolean
    isExpired?: boolean
    /** content would be hidden if the conditions overlay shows */
    hideContent?: boolean
    creator: string
    showConditionButton?: boolean
    onClickCondition?(): void
}
export function NftRedPacketEnvelope({
    cover,
    message,
    asset,
    shares = 1,
    claimedCount,
    total,
    isClaimed,
    isExpired,
    hideContent,
    isEmpty,
    creator,
    showConditionButton,
    onClickCondition,
    ...props
}: Props) {
    const { classes, cx } = useStyles()
    const claimedZero = isZero(claimedCount)
    const metadata = asset.metadata

    const pluginID = asset.runtime || NetworkPluginID.PLUGIN_EVM
    const networks = useNetworks(pluginID)
    const network = networks.find((x) => x.chainId === asset?.chainId)
    const assetId = `#${asset.id}`.replace(/^##/, '#')
    return (
        <div {...props} className={cx(classes.container, props.className)}>
            <img src={cover} className={classes.cover} />
            <div className={classes.content} style={{ display: hideContent ? 'none' : undefined }}>
                <div className={classes.message}>
                    <TextOverflowTooltip as={ShadowRootTooltip} title={message} placement="top">
                        <Typography key={message} className={classes.text}>
                            {message}
                        </Typography>
                    </TextOverflowTooltip>
                </div>
                <div className={classes.asset}>
                    {isClaimed ?
                        <div className={classes.assetCard}>
                            <Image
                                classes={{ container: classes.assetImage }}
                                src={metadata?.imageURL || metadata?.mediaURL || metadata?.previewImageURL}
                                fallback={metadata?.imageURL || metadata?.mediaURL || metadata?.previewImageURL}
                                width="100%"
                                height="100%"
                            />
                            <NetworkIcon
                                pluginID={pluginID}
                                className={classes.badgeIcon}
                                chainId={asset.chainId}
                                size={20}
                                network={network}
                            />
                            <div className={classes.assetInfo}>
                                <TextOverflowTooltip title={asset.collection?.name} as={ShadowRootTooltip}>
                                    <Typography className={classes.collectionName}>{asset.collection?.name}</Typography>
                                </TextOverflowTooltip>
                                <TextOverflowTooltip title={assetId} as={ShadowRootTooltip}>
                                    <Typography className={classes.assetId}>{assetId}</Typography>
                                </TextOverflowTooltip>
                            </div>
                        </div>
                    :   <TokenIcon
                            size={36}
                            badgeSize={16}
                            pluginID={pluginID}
                            logoURL={metadata?.imageURL || metadata?.mediaURL || metadata?.previewImageURL}
                            address={asset.address}
                            symbol={metadata?.symbol || metadata?.name}
                            chainId={asset.chainId}
                        />
                    }
                    {isClaimed ?
                        <Typography className={classes.amount}>{claimedZero ? null : `1 ${metadata?.name}`}</Typography>
                    :   <Typography className={classes.amount}>
                            {`${claimedCount} / ${total} `}
                            {metadata?.name}
                            {showConditionButton ?
                                <Icons.Questions size={24} onClick={onClickCondition} />
                            :   null}
                        </Typography>
                    }
                    <div className={classes.status}>
                        {isClaimed ?
                            <Typography className={classes.statusText}>
                                {claimedZero ?
                                    <Trans>You've already claimed the lucky drop</Trans>
                                :   <Trans>Congratulations!</Trans>}
                            </Typography>
                        : isEmpty ?
                            <>
                                <div className={classes.bar}>
                                    <div className={classes.progress} data-fulfilled />
                                </div>
                                <Typography className={classes.statusText}>
                                    <Trans>Empty</Trans>
                                </Typography>
                            </>
                        : isExpired ?
                            <Typography className={classes.statusText}>
                                <Trans>Expired</Trans>
                            </Typography>
                        :   <>
                                <div className={classes.bar}>
                                    <div className={classes.outline}></div>
                                    <div
                                        className={classes.progress}
                                        style={{ width: `${Math.min(1, claimedCount / shares) * 100}%` }}
                                    />
                                </div>
                                <Typography className={classes.statusText}>
                                    Claimed {claimedCount}/{shares}
                                </Typography>
                            </>
                        }
                    </div>
                </div>
                <Typography className={classes.creator}>From: @{creator.replace(/^@/, '')}</Typography>
            </div>
            <img src={new URL('../assets/nft-label.png', import.meta.url).href} className={classes.label} />
        </div>
    )
}
