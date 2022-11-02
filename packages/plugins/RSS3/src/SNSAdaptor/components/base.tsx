import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import type { FC, HTMLProps } from 'react'
import { useViewFeedDetails } from '../contexts'
import { CardType, cardTypeIconMap, platformIconMap } from './share'

export interface FeedCardBaseProps {
    feed: RSS3BaseAPI.Web3Feed
    /**
     * specified action from the feed
     * for donation feed. there might be multiple actions to render
     */
    action?: RSS3BaseAPI.Web3Feed['actions'][number]
    verbose?: boolean
    disableFee?: boolean
    inspectable?: boolean
}

export interface FeedCardProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {}

const useStyles = makeStyles()((theme) => ({
    inspectable: {
        cursor: 'pointer',
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

export interface CardFrameProps
    extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>,
        Omit<FeedCardBaseProps, 'verbose'> {
    type: CardType
}

export const CardFrame: FC<CardFrameProps> = ({
    type,
    feed,
    action,
    disableFee = true,
    inspectable,
    className,
    children,
    onClick,
    ...rest
}) => {
    const { classes, cx } = useStyles()
    const CardIcon = cardTypeIconMap[type]
    const PrimaryPlatformIcon = feed.network ? platformIconMap[feed.network] : null
    const ProviderPlatformIcon = feed.platform ? platformIconMap[feed.platform] : null

    const viewDetails = useViewFeedDetails()

    return (
        <article
            className={cx(className, inspectable ? classes.inspectable : null)}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                onClick?.(event)
                if (inspectable) {
                    viewDetails({
                        type,
                        feed,
                        action,
                    })
                }
            }}
            {...rest}>
            <div className={classes.header}>
                <CardIcon width={36} height={18} />
                {!disableFee ? (
                    <div className={classes.fee}>
                        <Icons.Gas size={16} />
                        <Typography ml="4px">{new BigNumber(feed.fee).toFixed(6)}</Typography>
                    </div>
                ) : null}
                {ProviderPlatformIcon ? <ProviderPlatformIcon className={classes.icon} size={18} /> : null}
                {PrimaryPlatformIcon ? <PrimaryPlatformIcon className={classes.icon} size={18} /> : null}
                <Typography className={classes.timestamp}>
                    {formatDateTime(new Date(feed.timestamp), 'MM/dd/yyyy')}
                </Typography>
            </div>
            <div className={classes.body}>{children}</div>
        </article>
    )
}
