import { makeStyles } from '@masknet/theme'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { Typography, Link } from '@mui/material'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'
import { NonFungibleTokenEvent, formatBalance, isZero, isValidTimestamp } from '@masknet/web3-shared-base'
import { ActivityType } from '../../types.js'
import { useI18N } from '../../../../../utils/index.js'

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
        alignItems: 'center',
        fontSize: 14,
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
        top: 8,
        right: 8,
        position: 'absolute',
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

export interface ActivityCardProps {
    type: ActivityType
    activity: NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function ActivityCard(props: ActivityCardProps) {
    const { activity, type } = props
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()

    return (
        <div className={classes.root}>
            <div className={classes.flex}>
                <Typography
                    className={type === ActivityType.Sale ? cx(classes.title, classes.highlight) : classes.title}>
                    {type}
                </Typography>
                {![ActivityType.Mint, ActivityType.CancelOffer].includes(type) &&
                    activity.priceInToken &&
                    !isZero(activity.priceInToken.amount) && (
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
                                {formatBalance(
                                    activity.priceInToken.amount,
                                    activity.priceInToken.token.decimals || 18,
                                    2,
                                )}
                            </Typography>
                        </div>
                    )}
            </div>
            <div className={classes.flex}>
                <Typography className={classes.textBase}>
                    {activity.from && (
                        <>
                            {t('plugin_collectible_from')}
                            <strong>
                                {activity.from.nickname ||
                                    (activity.from.address ? Others?.formatAddress(activity.from.address, 4) : '-')}
                            </strong>
                        </>
                    )}
                </Typography>
                <Typography className={classes.textBase}>
                    {activity.to && (
                        <>
                            {t('plugin_collectible_to')}
                            <strong>
                                {activity.to.nickname ||
                                    (activity.to.address ? Others?.formatAddress(activity.to.address, 4) : '-')}
                            </strong>
                        </>
                    )}
                    {isValidTimestamp(activity.timestamp) &&
                        formatDistanceToNowStrict(new Date(activity.timestamp!), {
                            addSuffix: true,
                        })}
                    {activity.hash && (
                        <Link
                            className={classes.link}
                            href={Others?.explorerResolver.transactionLink?.(activity.chainId, activity.hash) ?? ''}
                            target="_blank">
                            <Icons.LinkOut size={16} />
                        </Link>
                    )}
                </Typography>
            </div>
        </div>
    )
}
