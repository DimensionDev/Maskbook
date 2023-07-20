import { Icons } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptors, useReverseAddress } from '@masknet/web3-hooks-base'
import { DebankTransactionDirection } from '@masknet/web3-providers/types'
import { isLessThan, type Transaction } from '@masknet/web3-shared-base'
import { SchemaType, formatDomainName, formatEthereumAddress, type ChainId } from '@masknet/web3-shared-evm'
import { Box, ListItem, ListItemText, Typography, type ListItemProps, alpha, Skeleton } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../../utils/index.js'

const useStyles = makeStyles<{ cateType?: string }>()((theme, { cateType = '' }, __) => {
    const colorMap: Record<string, string> = {
        send: theme.palette.maskColor.warn,
        receive: theme.palette.maskColor.success,
        default: theme.palette.maskColor.primary,
    }
    const backgroundColorMap: Record<string, string> = {
        send: alpha(theme.palette.maskColor.warn, 0.1),
        receive: alpha(theme.palette.maskColor.success, 0.1),
        default: alpha(theme.palette.maskColor.success, 0.1),
    }
    const boxShadowMap: Record<string, string> = {
        send: alpha(theme.palette.maskColor.warn, 0.2),
        receive: alpha(theme.palette.maskColor.success, 0.2),
        default: alpha(theme.palette.maskColor.success, 0.2),
    }
    const iconColor = colorMap[cateType] || colorMap.default
    const iconBoxShadow = `0px 6px 12px 0px ${boxShadowMap[cateType] || boxShadowMap.default}`
    const iconBackgroundColor = backgroundColorMap[cateType] || backgroundColorMap.default

    return {
        item: {
            padding: theme.spacing(0.5, 0),
            cursor: 'pointer',
        },
        scamItem: {
            opacity: 0.5,
        },
        txIconContainer: {
            height: 32,
            width: 32,
            position: 'relative',
            flexShrink: 0,
        },
        txIcon: {
            height: 32,
            width: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: iconColor,
            boxShadow: iconBoxShadow,
            backgroundColor: iconBackgroundColor,
            backdropFilter: 'blur(8px)',
            position: 'absolute',
        },
        badgeIcon: {
            position: 'absolute',
            right: -4.5,
            bottom: -1,
            border: `1px solid ${theme.palette.common.white}`,
            borderRadius: '50%',
        },
        txName: {
            textTransform: 'capitalize',
        },
        failedLabel: {
            fontSize: 14,
            color: theme.palette.maskColor.danger,
            fontWeight: 400,
            marginRight: 4,
        },
        asset: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
        amount: {
            fontWeight: 700,
        },
        symbol: {
            fontWeight: 400,
        },
    }
})

interface TransactionIconProps {
    cateType: Transaction<ChainId, SchemaType>['cateType']
}
const TransactionIcon = memo(function TransactionIcon({ cateType }: TransactionIconProps) {
    const { classes, theme } = useStyles({ cateType })
    const mapType = cateType || 'default'
    const IconMap: Record<string, JSX.Element> = {
        send: <Icons.BaseUpload color={theme.palette.maskColor.warn} size={20} />,
        receive: <Icons.Download color={theme.palette.maskColor.success} size={20} />,
        default: <Icons.Cached color={theme.palette.maskColor.primary} size={20} />,
    }

    return <div className={classes.txIcon}>{IconMap[mapType] || IconMap.default}</div>
})

export interface ActivityListItemProps extends ListItemProps {
    transaction: Transaction<ChainId, SchemaType>
    onSpeedup: (tx: Transaction<ChainId, SchemaType>) => void
    onCancel: (tx: Transaction<ChainId, SchemaType>) => void
    onView: (tx: Transaction<ChainId, SchemaType>) => void
}

export const ActivityListItem = memo<ActivityListItemProps>(function ActivityListItem({
    transaction,
    className,
    onSpeedup,
    onCancel,
    onView,
    ...rest
}) {
    const { t } = useI18N()
    const { classes, cx } = useStyles({})
    const toAddress = transaction.to
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, toAddress)
    const descriptors = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    const networkDescriptor = descriptors.find((x) => x.chainId === transaction.chainId)

    return (
        <ListItem
            className={cx(classes.item, className, transaction.isScam ? classes.scamItem : null)}
            onClick={() => onView(transaction)}
            {...rest}>
            <Box className={classes.txIconContainer}>
                <TransactionIcon cateType={transaction.cateType} />
                <ImageIcon className={classes.badgeIcon} size={16} icon={networkDescriptor?.icon} />
            </Box>
            <ListItemText
                secondaryTypographyProps={{ component: 'div' }}
                style={{ marginLeft: 15 }}
                secondary={
                    <Box>
                        <Typography>
                            {!transaction.status ? (
                                <Typography className={classes.failedLabel} component="span">
                                    {t('failed')}
                                </Typography>
                            ) : null}
                            {t('to_address', {
                                address: domain ? formatDomainName(domain) : formatEthereumAddress(toAddress, 4),
                            })}
                        </Typography>
                        {/* TODO actions for pending transitions */}
                    </Box>
                }>
                <Typography className={classes.txName}>{transaction.cateName}</Typography>
            </ListItemText>
            <Box ml="auto">
                {transaction.assets
                    .filter((asset) => asset.schema === SchemaType.ERC20)
                    .map((token, i) => {
                        const isRend = token.direction === DebankTransactionDirection.SEND
                        const amount = isLessThan(token.amount, '0.000001') ? '<0.000001' : token.amount
                        return (
                            <Typography key={i} className={classes.asset}>
                                <strong className={classes.amount}>{`${isRend ? '-' : '+'} ${amount} `}</strong>
                                <span className={classes.symbol}>{token.symbol}</span>
                            </Typography>
                        )
                    })}
            </Box>
        </ListItem>
    )
})

export const ActivityListItemSkeleton = memo<ListItemProps>(function ActivityListItem({ className, ...rest }) {
    const { classes, cx } = useStyles({})

    return (
        <ListItem className={cx(classes.item, className)} {...rest}>
            <Box className={classes.txIconContainer}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" className={classes.badgeIcon} width={16} height={16} />
            </Box>
            <ListItemText
                secondaryTypographyProps={{ component: 'div' }}
                style={{ marginLeft: 15 }}
                secondary={<Skeleton variant="text" width={100} />}>
                <Skeleton variant="text" width={90} />
            </ListItemText>
            <Box ml="auto">
                <Skeleton variant="text" width={40} />
            </Box>
        </ListItem>
    )
})
