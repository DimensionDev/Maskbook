import { makeStyles } from '@masknet/theme'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Typography, Link } from '@mui/material'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        // there is no public bg have to hardcode
        background: '#fff',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
        color: theme.palette.maskColor.publicMain,
    },
    highlight: {
        color: theme.palette.maskColor.highlight,
    },
    salePrice: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    salePriceText: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
    },
    textBase: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.publicMain,
            margin: '0 4px',
        },
    },
    link: {
        color: theme.palette.maskColor.publicMain,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginLeft: 4,
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '14px',
        display: 'flex',
        alignItems: 'flex-end',
    },
}))

export enum ActivityType {
    Transfer = 'Transfer',
    Mint = 'Mint',
    Sale = 'Sale',
}
interface NFTActivityCardProps {
    type: ActivityType
    activity: NonFungibleTokenEvent<ChainId, SchemaType>
}

export function NFTActivityCard(props: NFTActivityCardProps) {
    const { activity, type } = props
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()
    const { t } = useI18N()
    return (
        <div className={classes.wrapper}>
            <div className={classes.flex}>
                <Typography
                    className={type === ActivityType.Sale ? cx(classes.title, classes.highlight) : classes.title}>
                    {type}
                </Typography>
                {type === ActivityType.Sale && (
                    <div className={classes.salePrice}>
                        {(activity.paymentToken?.logoURL && (
                            <img width={24} height={24} src={activity.paymentToken?.logoURL} alt="" />
                        )) || (
                            <Typography className={classes.fallbackSymbol}>
                                {activity.paymentToken?.symbol || activity.paymentToken?.name}
                            </Typography>
                        )}
                        <Typography className={classes.salePriceText}>{activity.price?.usd ?? '-'}</Typography>
                    </div>
                )}
            </div>
            <div className={classes.flex}>
                <Typography className={classes.textBase}>
                    {t('plugin_collectible_from')}
                    <strong> {activity.from.address ? Others?.formatAddress(activity.from.address, 4) : '-'}</strong>
                </Typography>
                <Typography className={classes.textBase}>
                    {t('plugin_collectible_to')}
                    <strong>
                        {activity.to.nickname ||
                            (activity.to.address ? Others?.formatAddress(activity.to.address, 4) : '-')}
                    </strong>
                    {activity.timestamp &&
                        formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                        })}
                    {activity.hash && (
                        <Link
                            className={classes.link}
                            href={Others?.explorerResolver.transactionLink?.(ChainId.Mainnet, activity.hash) ?? ''}
                            target="_blank">
                            <Icons.LinkOut size={16} />
                        </Link>
                    )}
                </Typography>
            </div>
        </div>
    )
}
