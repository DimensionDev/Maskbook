import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import type { FC, HTMLProps, ReactNode } from 'react'
import formatDateTime from 'date-fns/format'
import { useViewFeedDetails } from '../contexts/index.js'
import { CardType, cardTypeIconMap, formatTimestamp, getPlatformIcon } from './share.js'

export interface FeedCardBaseProps {
    feed: RSS3BaseAPI.Web3Feed
    /**
     * to specify action from the feed
     * for example donation feed. there might be multiple actions to render
     */
    actionIndex?: number
    /**
     * verbose variant is
     * - not inspectable (no clickable)
     * - show more details, including fee, more other content, different layout
     */
    verbose?: boolean
}

export interface FeedCardProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {}

const useStyles = makeStyles()((theme) => ({
    inspectable: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
    },
    header: {
        display: 'flex',
    },
    fee: {
        display: 'flex',
        fontWeight: 400,
        fontSize: 12,
        borderRadius: '4px',
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.third,
        height: 20,
        padding: '0 4px',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(1.5),
    },
    timestamp: {
        marginLeft: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.third,
    },
    body: {
        marginTop: theme.spacing(1.5),
    },
    icon: {
        marginLeft: theme.spacing(1.5),
    },
}))

export interface CardFrameProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {
    type: CardType
    badge?: ReactNode
}

export const CardFrame: FC<CardFrameProps> = ({
    type,
    feed,
    actionIndex,
    className,
    children,
    onClick,
    verbose,
    badge,
    ...rest
}) => {
    const { classes, cx } = useStyles()
    const CardIcon = cardTypeIconMap[type]
    const PrimaryPlatformIcon = getPlatformIcon(feed.network)
    const ProviderPlatformIcon = getPlatformIcon(feed.platform)

    const viewDetails = useViewFeedDetails()

    return (
        <article
            className={cx(className, verbose ? null : classes.inspectable)}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                onClick?.(event)
                if (!verbose) {
                    viewDetails({
                        type,
                        feed,
                        actionIndex,
                    })
                }
            }}
            {...rest}>
            <div className={classes.header}>
                <CardIcon width={36} height={18} />
                {verbose && feed.fee ? (
                    <div className={classes.fee}>
                        <Icons.Gas size={16} />
                        <Typography ml="4px">{new BigNumber(feed.fee).toFixed(6)}</Typography>
                    </div>
                ) : null}
                {ProviderPlatformIcon ? (
                    <ProviderPlatformIcon className={classes.icon} height={18} width="auto" />
                ) : null}
                {PrimaryPlatformIcon && PrimaryPlatformIcon !== ProviderPlatformIcon ? (
                    <PrimaryPlatformIcon className={classes.icon} height={18} width="auto" />
                ) : null}
                <ShadowRootTooltip title={formatDateTime(new Date(feed.timestamp), 'yyyy-MM-dd HH:mm:ss')}>
                    <Typography className={classes.timestamp}>{formatTimestamp(feed.timestamp)}</Typography>
                </ShadowRootTooltip>
                {badge}
            </div>
            <div className={classes.body}>{children}</div>
        </article>
    )
}
