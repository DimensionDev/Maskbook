import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import type { HTMLProps, ReactNode } from 'react'
import { format as formatDateTime } from 'date-fns'
import { type CardType, formatTimestamp, getPlatformIcon } from './share.js'
import { FeedDetailsModal } from '../modals/modals.js'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'

interface FeedCardBaseProps {
    feed: RSS3BaseAPI.Web3Feed
    /**
     * to specify action from the feed
     * for example donation feed. there might be multiple actions to render
     */
    actionIndex?: number
    /**
     * verbose variant is
     * - not inspectable (not clickable)
     * - showing more details, including fee, and more other content, in different layout
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
        gap: theme.spacing(1.5),
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
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.third,
    },
    body: {
        marginTop: theme.spacing(1.5),
        flexGrow: 1,
    },
}))

interface CardFrameProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {
    type: CardType
    badge?: ReactNode
}

export function CardFrame({
    type,
    feed,
    actionIndex,
    className,
    children,
    onClick,
    verbose,
    badge,
    ...rest
}: CardFrameProps) {
    const { classes, cx } = useStyles()
    const PrimaryPlatformIcon = getPlatformIcon(feed.network)
    const ProviderPlatformIcon = getPlatformIcon(feed.platform)
    const { map } = ScopedDomainsContainer.useContainer()

    return (
        <article
            className={cx(className, verbose ? null : classes.inspectable)}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                onClick?.(event)
                if (!verbose) {
                    FeedDetailsModal.open({
                        type,
                        scopedDomainsMap: map,
                        feed,
                        actionIndex,
                    })
                }
            }}
            {...rest}>
            <div className={classes.header}>
                {verbose && feed.fee ?
                    <div className={classes.fee}>
                        <Icons.Gas size={16} />
                        <Typography ml="4px">{new BigNumber(feed.fee).toFixed(6)}</Typography>
                    </div>
                :   null}
                {ProviderPlatformIcon ?
                    <ProviderPlatformIcon height={18} width="auto" />
                :   null}
                {PrimaryPlatformIcon && PrimaryPlatformIcon !== ProviderPlatformIcon ?
                    <PrimaryPlatformIcon height={18} width="auto" />
                :   null}
                <ShadowRootTooltip
                    title={formatDateTime(new Date(feed.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')}
                    placement="right">
                    <Typography className={classes.timestamp}>{formatTimestamp(feed.timestamp * 1000)}</Typography>
                </ShadowRootTooltip>
                {badge}
            </div>
            <div className={classes.body}>{children}</div>
        </article>
    )
}
