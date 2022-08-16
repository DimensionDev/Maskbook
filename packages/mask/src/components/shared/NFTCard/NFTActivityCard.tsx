import { makeStyles } from '@masknet/theme'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Typography } from '@mui/material'
import { ExternalLink, Link } from 'react-feather'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
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
        background: theme.palette.maskColor.bottom,
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
        color: theme.palette.maskColor.main,
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
        color: theme.palette.maskColor.main,
    },
    textBase: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        '& > strong': {
            color: theme.palette.text.primary,
            margin: '0 4px',
        },
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
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
                        <img src={activity.paymentToken?.logoURL} width={24} height={24} />
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
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.transactionLink(ChainId.Mainnet, activity.hash ?? '') ?? ''}
                        target="_blank">
                        <ExternalLink style={{ marginLeft: 4 }} size={14} />
                    </Link>
                </Typography>
            </div>
        </div>
    )
}
