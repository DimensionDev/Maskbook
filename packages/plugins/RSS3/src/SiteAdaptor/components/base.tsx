import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import type { HTMLProps, ReactNode } from 'react'
import { format as formatDateTime } from 'date-fns'
import { type CardType, formatTimestamp, PlatformIcon } from './share.js'
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
     * - not clickable
     * - showing more details, including fee, and more other content, in different layout
     */
    verbose?: boolean
}

export interface FeedCardProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {}

const useStyles = makeStyles()((theme) => ({
    clickable: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.vars.palette.maskColor.bg,
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    timestamp: {
        fontSize: 14,
        fontWeight: 400,
        color: theme.vars.palette.maskColor.third,
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
    const { map } = ScopedDomainsContainer.useContainer()

    return (
        <article
            className={cx(className, verbose ? null : classes.clickable)}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                onClick?.(event)
                if (!verbose) {
                    FeedDetailsModal.open({
                        scopedDomainsMap: map,
                        feed,
                        actionIndex,
                    })
                }
            }}
            {...rest}>
            <div className={classes.header}>
                {feed.network.toLowerCase() === feed.platform.toLowerCase() ? null : (
                    <PlatformIcon platform={feed.network} height={18} width="auto" />
                )}
                <PlatformIcon platform={feed.platform} height={18} width="auto" />
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
