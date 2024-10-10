import { makeStyles } from '@masknet/theme'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { formatDistanceToNowStrict } from 'date-fns'
import { Typography, Link } from '@mui/material'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'
import {
    type NonFungibleTokenEvent,
    formatBalance,
    isZero,
    isValidTimestamp,
    ActivityType,
} from '@masknet/web3-shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        color: theme.palette.maskColor.second,
        backgroundColor: theme.palette.maskColor.bg,
        position: 'relative',
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    highlight: {
        // there is no public highlight color, temp hardcode
        color: '#1C68F3',
    },
    salePrice: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginRight: theme.spacing(2),
    },
    salePriceText: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    textBase: {
        display: 'flex',
        fontSize: 14,
        alignItems: 'center',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.main,
            margin: '0px 8px',
        },
    },
    link: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginLeft: 4,
    },
    linkOut: {
        color: theme.palette.maskColor.secondaryDark,
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '14px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

interface ActivityCardProps {
    activity: NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function ActivityCard(props: ActivityCardProps) {
    const { activity } = props
    const { type } = activity
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils()

    return (
        <div className={classes.root}>
            <div className={classes.flex}>
                <Typography
                    className={type === ActivityType.Sale ? cx(classes.title, classes.highlight) : classes.title}>
                    {type}
                </Typography>
                {(
                    ![ActivityType.Mint, ActivityType.CancelOffer].includes(type) &&
                    activity.priceInToken &&
                    !isZero(activity.priceInToken.amount)
                ) ?
                    <div className={classes.salePrice}>
                        {(activity.paymentToken?.logoURL && (
                            <img
                                width={24}
                                height={24}
                                src={activity.priceInToken.token.logoURL}
                                alt={activity.priceInToken.token.symbol}
                            />
                        )) || (
                            <Typography className={classes.fallbackSymbol}>
                                {activity.priceInToken.token.symbol || activity.priceInToken.token.name}
                            </Typography>
                        )}
                        <Typography className={classes.salePriceText}>
                            {formatBalance(activity.priceInToken.amount, activity.priceInToken.token.decimals || 18, {
                                significant: 2,
                            })}
                        </Typography>
                    </div>
                :   null}
            </div>
            <div className={classes.flex}>
                {activity.send ?
                    <Typography className={classes.textBase}>
                        <Trans>From</Trans>
                        <strong title={activity.send.address}>
                            {type === ActivityType.Mint ?
                                Utils.formatAddress(ZERO_ADDRESS, 4)
                            :   activity.send.nickname ||
                                (activity.send.address ? Utils.formatAddress(activity.send.address, 4) : '-')
                            }
                        </strong>
                    </Typography>
                :   null}
                <Typography className={classes.textBase}>
                    {activity.receive && activity.from?.address ?
                        <Trans>
                            To{' '}
                            {
                                <strong title={activity.receive.address}>
                                    {type === ActivityType.Mint ?
                                        Utils.formatAddress(activity.from?.address, 4)
                                    :   activity.receive.nickname ||
                                        (activity.receive.address ?
                                            Utils.formatAddress(activity.receive.address, 4)
                                        :   '-')
                                    }
                                </strong>
                            }
                        </Trans>
                    :   null}
                    {isValidTimestamp(activity.timestamp) &&
                        formatDistanceToNowStrict(new Date(activity.timestamp), {
                            addSuffix: true,
                        })}
                    {activity.hash ?
                        <Link
                            className={classes.link}
                            href={Utils.explorerResolver.transactionLink?.(activity.chainId, activity.hash) ?? ''}
                            target="_blank">
                            <Icons.LinkOut className={classes.linkOut} size={16} />
                        </Link>
                    :   null}
                </Typography>
            </div>
        </div>
    )
}
