import { Icons } from '@masknet/icons'
import { ImageIcon, NetworkIcon, ProgressiveText, ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { TextOverflowTooltip, makeStyles, useBoundedPopperProps } from '@masknet/theme'
import {
    useAccount,
    useFungibleToken,
    useNativeToken,
    useNetwork,
    useNetworkDescriptors,
    useReverseAddress,
} from '@masknet/web3-hooks-base'
import { ChainbaseHistory, EVMWeb3 } from '@masknet/web3-providers'
import { chainbase } from '@masknet/web3-providers/helpers'
import { DebankTransactionDirection } from '@masknet/web3-providers/types'
import {
    TransactionStatusType,
    isLessThan,
    isSameAddress,
    toFixed,
    trimZero,
    type RecentTransaction,
    type Transaction,
} from '@masknet/web3-shared-base'
import {
    formatDomainName,
    formatEthereumAddress,
    type ChainId,
    type Transaction as EvmTransaction,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import { Box, ListItem, ListItemText, Skeleton, Typography, alpha, type ListItemProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo, type JSX } from 'react'
import { MaskSharedTrans, useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { formatTokenBalance } from '../../../../../shared/index.js'
import { parseAmountFromERC20ApproveInput, parseReceiverFromERC20TransferInput } from '../../utils.js'

const useStyles = makeStyles<{ cateType?: string }>()((theme, { cateType = '' }, __) => {
    const colorMap: Record<string, string> = {
        send: theme.palette.maskColor.warn,
        receive: theme.palette.maskColor.success,
        default: theme.palette.maskColor.primary,
    }
    const backgroundColorMap: Record<string, string> = {
        send: alpha(theme.palette.maskColor.warn, 0.1),
        receive: alpha(theme.palette.maskColor.success, 0.1),
        default: alpha(theme.palette.maskColor.primary, 0.1),
    }
    const boxShadowMap: Record<string, string> = {
        send: alpha(theme.palette.maskColor.warn, 0.2),
        receive: alpha(theme.palette.maskColor.success, 0.2),
        default: alpha(theme.palette.maskColor.primary, 0.2),
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
            borderColor: alpha(iconColor, 0.5),
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
            whiteSpace: 'nowrap',
            fontWeight: 700,
        },
        scamLabel: {
            display: 'inline-block',
            padding: '4px 6px',
            backgroundColor: theme.palette.maskColor.third,
            color: theme.palette.maskColor.white,
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 700,
            marginLeft: 4,
            borderRadius: 4,
        },
        toAddress: {
            whiteSpace: 'nowrap',
            color: theme.palette.maskColor.second,
        },
        operations: {
            display: 'flex',
            gap: 6,
            marginTop: theme.spacing(0.5),
        },
        button: {
            borderRadius: 4,
            padding: '4px 6px',
            border: 'none',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
        },
        speedupButton: {
            backgroundColor: alpha(theme.palette.maskColor.primary, 0.1),
            color: theme.palette.maskColor.primary,
        },
        cancelButton: {
            backgroundColor: alpha(theme.palette.maskColor.danger, 0.1),
            color: theme.palette.maskColor.danger,
        },
        failedLabel: {
            fontSize: 14,
            color: theme.palette.maskColor.danger,
            fontWeight: 400,
            marginRight: 4,
        },
        assets: {
            marginLeft: theme.spacing(1),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        asset: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            textAlign: 'right',
            display: 'inline-flex',
            alignItems: 'center',
        },
        amount: {
            fontWeight: 700,
        },
        symbol: {
            display: 'inline-block',
            fontWeight: 400,
            maxWidth: '9ch',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            marginLeft: theme.spacing(0.5),
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

interface ActivityItemProps extends ListItemProps {
    transaction: Transaction<ChainId, SchemaType>
    onView: (tx: Transaction<ChainId, SchemaType>) => void
}

export const ActivityItem = memo<ActivityItemProps>(function ActivityItem({ transaction, className, onView, ...rest }) {
    const t = useMaskSharedTrans()
    const { classes, cx } = useStyles({})
    const descriptors = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    const networkDescriptor = descriptors.find((x) => x.chainId === transaction.chainId)

    const blockNumber = transaction && 'blockNumber' in transaction ? (transaction.blockNumber as number) : undefined
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    const { data: tx, isPending: loadingTx } = useQuery({
        // This could be a transaction of SmartPay which Debank doesn't provide detailed info for it.
        // This also could be an ERC20 transfer, which Debank returns the token contract rather than receiver as `to_address`.
        // So we fetch via Chainbase
        enabled: (!transaction.to || transaction.type === 'transfer' || transaction.type === 'approve') && seen,
        queryKey: ['chainbase', 'transaction', transaction.chainId, transaction.id, blockNumber],
        queryFn: async () => {
            if (!transaction.chainId || !transaction.id) return
            return ChainbaseHistory.getTransaction(transaction.chainId, transaction.id, blockNumber)
        },
    })
    const { data: txInput, isPending: loadingTxInput } = useQuery({
        // Enable this when chainbase does not support the current chain.
        enabled: !!transaction && !loadingTx && !tx?.input && transaction.type === 'transfer',
        queryKey: [transaction.chainId, transaction.id],
        queryFn: async () => {
            if (!transaction.chainId || !transaction.id) return
            const tx = await EVMWeb3.getTransaction(transaction.id, { chainId: transaction.chainId })
            return tx.input
        },
    })

    const receiverAddress = parseReceiverFromERC20TransferInput(tx?.input ?? txInput)
    const status = transaction.status ?? (tx ? chainbase.normalizeTxStatus(tx.status) : undefined)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const fromAddress = (transaction.from || tx?.from_address) as string
    const toAddress = (receiverAddress || transaction.to || tx?.to_address) as string
    const loadingToAddress =
        transaction.type === 'transfer' ? !receiverAddress && (loadingTx || loadingTxInput) : !toAddress && loadingTx
    const isOut = isSameAddress(fromAddress, account)
    const popperProps = useBoundedPopperProps()
    const approveAmount = parseAmountFromERC20ApproveInput(tx?.input ?? txInput)
    const { data: approveToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        transaction.type === 'approve' ? tx?.to_address : '',
        undefined,
        { chainId: transaction.chainId },
    )

    return (
        <ListItem
            className={cx(classes.item, className, transaction.isScam ? classes.scamItem : null)}
            onClick={() => onView(transaction)}
            ref={ref}
            {...rest}>
            <Box className={classes.txIconContainer}>
                <TransactionIcon cateType={transaction.cateType} />
                <ImageIcon className={classes.badgeIcon} size={16} icon={networkDescriptor?.icon} />
            </Box>
            <ListItemText
                secondaryTypographyProps={{ component: 'div' }}
                style={{ marginLeft: 15 }}
                secondary={
                    <ProgressiveText
                        className={classes.toAddress}
                        loading={loadingToAddress}
                        skeletonWidth={100}
                        component="div">
                        {status === TransactionStatusType.FAILED ?
                            <Typography className={classes.failedLabel} component="span">
                                {t.failed()}
                            </Typography>
                        :   null}
                        {/* eslint-disable-next-line react/naming-convention/component-name */}
                        <MaskSharedTrans.other_address
                            context={isOut ? 'to' : 'from'}
                            values={{
                                address: isOut ? toAddress : fromAddress,
                            }}
                            components={{
                                addr: <ReversedAddress address={isOut ? toAddress : fromAddress} component="span" />,
                            }}
                        />
                    </ProgressiveText>
                }>
                <Typography className={classes.txName}>
                    {transaction.cateName}
                    {transaction.isScam ?
                        <span className={classes.scamLabel}>{t.scam_tx()}</span>
                    :   null}
                </Typography>
            </ListItemText>

            {transaction.type === 'approve' && approveAmount && approveToken ?
                <Typography className={classes.asset} component="div">
                    <strong className={classes.amount}>
                        {approveAmount === 'Infinite' ?
                            approveAmount
                        :   formatTokenBalance(approveAmount, approveToken.decimals)}
                    </strong>
                    <TextOverflowTooltip title={approveToken.symbol} PopperProps={popperProps}>
                        <span className={classes.symbol}>{approveToken.symbol}</span>
                    </TextOverflowTooltip>
                </Typography>
            :   <div className={classes.assets}>
                    {transaction.assets.map((token, i) => {
                        const isSend = token.direction === DebankTransactionDirection.SEND
                        const amount =
                            isLessThan(token.amount, '0.0001') ? '<0.0001' : trimZero(toFixed(token.amount, 4))
                        return (
                            <Typography key={i} className={classes.asset} component="div">
                                <strong className={classes.amount}>{`${isSend ? '-' : '+'} ${amount} `}</strong>
                                <TextOverflowTooltip title={token.symbol} PopperProps={popperProps}>
                                    <span className={classes.symbol}>{token.symbol}</span>
                                </TextOverflowTooltip>
                            </Typography>
                        )
                    })}
                </div>
            }
        </ListItem>
    )
})

interface RecentActivityItemProps extends Omit<ActivityItemProps, 'transaction' | 'onView'> {
    transaction: RecentTransaction<ChainId, EvmTransaction>
    onView: (tx: RecentTransaction<ChainId, EvmTransaction>, candidate?: EvmTransaction) => void
    onSpeedup?: (tx: RecentTransaction<ChainId, EvmTransaction>) => void
    onCancel?: (tx: RecentTransaction<ChainId, EvmTransaction>) => void
}

export const RecentActivityItem = memo<RecentActivityItemProps>(function RecentActivityItem({
    transaction,
    className,
    onSpeedup,
    onCancel,
    onView,
    ...rest
}) {
    const t = useMaskSharedTrans()
    const { classes, cx } = useStyles({})
    // candidate is current transaction
    const candidate = transaction.candidates[transaction.indexId]
    const receiverAddress = parseReceiverFromERC20TransferInput(candidate.data)
    const toAddress = receiverAddress || candidate.to
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, toAddress)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId: transaction.chainId })
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, transaction.chainId)

    const recipient = useMemo(() => {
        if (domain) return t.to_address({ address: formatDomainName(domain) })
        if (toAddress) return t.to_address({ address: formatEthereumAddress(toAddress, 4) })
        return undefined
    }, [domain, t])

    return (
        <ListItem className={cx(classes.item, className)} onClick={() => onView(transaction, candidate)} {...rest}>
            <Box className={classes.txIconContainer}>
                {/* TODO specify cateType */}
                <TransactionIcon cateType={'send'} />
                <NetworkIcon
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.badgeIcon}
                    chainId={transaction.chainId}
                    size={16}
                    network={network}
                />
            </Box>
            <ListItemText
                secondaryTypographyProps={{ component: 'div' }}
                style={{ marginLeft: 15 }}
                secondary={
                    <Box>
                        <Typography>
                            {transaction.status === TransactionStatusType.FAILED ?
                                <Typography className={classes.failedLabel} component="span">
                                    {t.failed()}
                                </Typography>
                            :   null}
                            {recipient}
                        </Typography>
                        {transaction.status === 1 ?
                            <Box className={classes.operations}>
                                <button
                                    type="button"
                                    className={cx(classes.button, classes.speedupButton)}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSpeedup?.(transaction)
                                    }}>
                                    {t.speed_up()}
                                </button>
                                <button
                                    type="button"
                                    className={cx(classes.button, classes.cancelButton)}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCancel?.(transaction)
                                    }}>
                                    {t.cancel()}
                                </button>
                            </Box>
                        :   null}
                    </Box>
                }>
                {/* TODO specify cateType */}
                <Typography className={classes.txName}>{t.send()}</Typography>
            </ListItemText>
            <Box ml="auto">
                {candidate.value && nativeToken ?
                    <Typography className={classes.asset}>
                        <strong className={classes.amount}>
                            {`- ${formatTokenBalance(candidate.value, nativeToken.decimals)} `}
                        </strong>
                        <span className={classes.symbol}>{nativeToken.symbol}</span>
                    </Typography>
                :   null}
            </Box>
        </ListItem>
    )
})

export const ActivityItemSkeleton = memo<ListItemProps>(function ActivityItemSkeleton({ className, ...rest }) {
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
