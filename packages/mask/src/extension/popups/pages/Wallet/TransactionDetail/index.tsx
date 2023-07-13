import { Icons } from '@masknet/icons'
import { CopyButton, ReversedAddress, ProgressiveText } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { trimZero, type Transaction, multipliedBy, formatBalance } from '@masknet/web3-shared-base'
import {
    explorerResolver,
    type ChainId,
    type SchemaType,
    formatHash,
    formatWeiToGwei,
    formatWeiToEther,
} from '@masknet/web3-shared-evm'
import { Box, Link, Typography, alpha } from '@mui/material'
import { memo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTitle } from '../../../hook/useTitle.js'
import { WalletAssetTabs } from '../type.js'
import { makeStyles } from '@masknet/theme'
import { capitalize } from 'lodash-es'
import { useQuery } from '@tanstack/react-query'
import { ChainbaseHistory } from '@masknet/web3-providers'
import { useAccount, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    statusTitle: {
        fontSize: 14,
        fontWeight: 700,
    },
    status: {
        padding: theme.spacing(1),
        borderRadius: 8,
        display: 'inline-flex',
        fontSize: 18,
        fontWeight: 700,
        marginLeft: 'auto',
        alignItems: 'center',
        gap: 4,
    },
    statusFail: {
        color: theme.palette.maskColor.danger,
        backgroundColor: alpha(theme.palette.maskColor.danger, 0.1),
    },
    statusSuccess: {
        color: theme.palette.maskColor.success,
        backgroundColor: alpha(theme.palette.maskColor.success, 0.1),
    },
    statusPending: {
        color: theme.palette.maskColor.warn,
        backgroundColor: alpha(theme.palette.maskColor.warn, 0.1),
    },
    field: {
        display: 'flex',
        marginTop: theme.spacing(1.5),
    },
    fieldName: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        fontWeight: 700,
    },
    fieldValue: {
        minWidth: '5em',
        color: theme.palette.maskColor.main,
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontSize: 12,
        fontWeight: 700,
    },
    sectionName: {
        marginTop: theme.spacing(1.5),
        backgroundColor: theme.palette.maskColor.bg,
        padding: 10,
        fontSize: 14,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        borderRadius: 4,
    },
}))

export const TransactionDetail = memo(function TransactionDetail() {
    const { classes, cx, theme } = useStyles()
    const location = useLocation()
    const transaction = location.state.transaction as Transaction<ChainId, SchemaType> | undefined
    const account = useAccount()
    useTitle(capitalize(transaction?.cateName || 'Transaction'))
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId: transaction?.chainId })
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: transaction?.chainId,
    })

    const { data: tx, isLoading: loadingTx } = useQuery({
        enabled: !!transaction,
        queryKey: ['chainbase', 'transaction', transaction?.chainId, transaction?.id, transaction?.blockNumber],
        queryFn: async () => {
            if (!transaction) return
            return ChainbaseHistory.getTransaction(transaction.chainId, transaction.id, transaction.blockNumber)
        },
    })
    if (!transaction) {
        return <Navigate to={`${PopupRoutes.Wallet}?tab=${WalletAssetTabs.Activity}`} replace />
    }

    const StatusIconMap = {
        0: <Icons.BaseClose size={20} />,
        1: <Icons.FillSuccess size={20} />,
        2: <Icons.WarningTriangle size={20} />,
    }
    const StatusClassesMap = {
        0: classes.statusFail,
        1: classes.statusSuccess,
        2: classes.statusPending,
    }
    const StatusLabelMap = {
        0: 'Failed',
        1: 'Success',
        2: 'Pending',
    }
    const { status = 2 } = transaction
    const isOut = transaction.from === account
    const link = explorerResolver.transactionLink(transaction.chainId, transaction.id)

    const gasUsedPercent = tx ? (tx.gas_used * 100) / tx.gas : 0
    const gasFee = tx ? formatWeiToEther(multipliedBy(tx.gas_price, tx.gas)) : undefined
    const gasCost = gasFee && nativeTokenPrice ? gasFee.times(nativeTokenPrice) : undefined

    return (
        <Box p={2}>
            <Box display="flex" alignItems="center">
                <Typography variant="h2" className={classes.statusTitle}>
                    Status
                </Typography>
                <Typography component="div" className={cx(classes.status, StatusClassesMap[status])}>
                    {StatusIconMap[status]}
                    {StatusLabelMap[status]}
                </Typography>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Transaction Hash</Typography>
                <Typography className={classes.fieldValue}>
                    {formatHash(transaction.id, 4)}
                    {transaction.id ? <CopyButton size={16} text={transaction.id} sx={{ ml: 0.5 }} /> : null}
                </Typography>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Link</Typography>
                <Typography className={classes.fieldValue}>
                    View on block explorer
                    <Link href={link} target="_blank" ml={0.5} fontSize={0}>
                        <Icons.LinkOut size={16} color={theme.palette.maskColor.second} />
                    </Link>
                </Typography>
            </Box>
            <Typography variant="h2" className={classes.sectionName}>
                Base
            </Typography>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>From</Typography>
                <Typography className={classes.fieldValue} component="div">
                    <ReversedAddress address={transaction.from} />
                </Typography>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>To</Typography>
                <Typography className={classes.fieldValue} component="div">
                    <ReversedAddress address={transaction.to} />
                </Typography>
            </Box>
            <Typography variant="h2" className={classes.sectionName}>
                Transaction
            </Typography>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Nonce</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {tx?.nonce}
                </ProgressiveText>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Amount</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {tx && nativeToken
                        ? `${isOut ? '-' : '+'}${formatBalance(tx.value, nativeToken.decimals, 6)} ${
                              nativeToken.symbol
                          }`
                        : ''}
                </ProgressiveText>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Gas Limit (Units)</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {tx?.gas}
                </ProgressiveText>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Gas Used (Units)</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {tx?.gas_used}
                    {gasUsedPercent ? ` (${trimZero(gasUsedPercent.toFixed(1))}%)` : ''}
                </ProgressiveText>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Gas Price (GWEI)</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {tx ? formatWeiToGwei(tx.gas_price).toFixed(6) : ''}
                </ProgressiveText>
            </Box>
            {tx?.max_priority_fee_per_gas ? (
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>Priority Fee (GWEI)</Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx ? formatWeiToGwei(tx.max_priority_fee_per_gas).toFixed(6) : ''}
                    </ProgressiveText>
                </Box>
            ) : null}
            {tx?.max_fee_per_gas ? (
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>Max Fee (GWEI)</Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx ? formatWeiToGwei(tx.max_fee_per_gas).toFixed(6) : ''}
                    </ProgressiveText>
                </Box>
            ) : null}
            <Box className={classes.field}>
                <Typography className={classes.fieldName}>Transaction Fee</Typography>
                <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                    {gasFee ? `${gasFee.toFixed(6)} ${nativeToken?.symbol}` : ''}
                    {gasCost ? ` ≈ $${gasCost.toFixed(2)}` : ''}
                </ProgressiveText>
            </Box>
            <Typography variant="h2" className={classes.sectionName}>
                Activity Log
            </Typography>
        </Box>
    )
})
