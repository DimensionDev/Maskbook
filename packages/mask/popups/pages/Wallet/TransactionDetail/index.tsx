import { Icons } from '@masknet/icons'
import { CopyButton, FormattedCurrency, ProgressiveText, ReversedAddress } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles } from '@masknet/theme'
import { useAccount, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { ChainbaseHistory, EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import { chainbase } from '@masknet/web3-providers/helpers'
import {
    TransactionStatusType,
    formatBalance,
    formatCurrency,
    isSameAddress,
    multipliedBy,
    trimZero,
} from '@masknet/web3-shared-base'
import {
    formatHash,
    formatWeiToEther,
    formatWeiToGwei,
    type Transaction as EvmTransaction,
} from '@masknet/web3-shared-evm'
import { Box, Link, Typography, alpha } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { capitalize } from 'lodash-es'
import { memo, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTitle } from '../../../hooks/index.js'
import { ReplaceType, WalletAssetTabs } from '../type.js'
import { modifyTransaction, parseReceiverFromERC20TransferInput } from '../utils.js'
import type { TransactionState } from './types.js'
import { useTransactionLogs } from './useTransactionLogs.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    statusTitle: {
        fontSize: 14,
        fontWeight: 700,
        textTransform: 'capitalize',
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
        transition: 'all 0.3s ease-in-out',
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
    logs: {
        padding: 0,
        margin: 0,
        listStyleType: 'none',
    },
    log: {
        marginTop: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
    },
    index: {
        height: 22,
        width: 22,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #1C68F3 0%, #8EB6FF 99.00%)',
        borderRadius: '50%',
        color: MaskColors.light.maskColor.white,
        fontSize: 12,
        fontWeight: 700,
    },
    logText: {
        lineHeight: '16px',
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1.5),
        fontWeight: 700,
        fontSize: 12,
    },
    actionGroup: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        width: '100%',
        bottom: 0,
        zIndex: 100,
        marginTop: 'auto',
    },
    speedupButton: {
        backgroundColor: MaskColors.light.maskColor.primary,
        color: MaskColors.light.maskColor.white,
        '&:hover': {
            backgroundColor: MaskColors.light.maskColor.primary,
            color: MaskColors.light.maskColor.white,
        },
    },
}))

export const Component = memo(function TransactionDetail() {
    const { classes, cx, theme } = useStyles()
    const location = useLocation()
    const transactionState = location.state.transaction as TransactionState | undefined
    const candidateState = location.state.candidate as EvmTransaction | undefined
    const isRecentTx = transactionState && 'candidates' in transactionState
    const transaction = isRecentTx ? transactionState.candidates[transactionState.id] : transactionState
    const account = useAccount()
    const chainId = transactionState?.chainId
    const transactionId = transactionState?.id
    const blockNumber = transaction && 'blockNumber' in transaction ? transaction.blockNumber : undefined
    useTitle(capitalize(transaction && 'cateName' in transaction ? transaction.cateName : 'Transaction'))
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId: transaction?.chainId })
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: transaction?.chainId,
    })

    const { data: tx, isPending: loadingTx } = useQuery({
        enabled: !!transaction,
        queryKey: ['chainbase', 'transaction', transaction?.chainId, transactionId, blockNumber],
        queryFn: async () => {
            if (!chainId || !transactionId) return null
            return ChainbaseHistory.getTransaction(chainId, transactionId, blockNumber)
        },
    })

    const { data: txInput, isPending: loadingTxInput } = useQuery({
        enabled:
            !!transaction && !loadingTx && !tx?.input && transactionState?.type === 'transfer' && !candidateState?.data,
        queryKey: [transaction?.chainId, transactionId],
        queryFn: async () => {
            if (!chainId || !transactionId) return
            const tx = await EVMWeb3.getTransaction(transactionId, { chainId })
            return tx?.input
        },
    })

    const handleSpeedup = useCallback(() => {
        if (!isRecentTx) return
        return modifyTransaction(transactionState, ReplaceType.SPEED_UP)
    }, [isRecentTx, transactionState])

    const handleCancel = useCallback(() => {
        if (!isRecentTx) return
        modifyTransaction(transactionState, ReplaceType.CANCEL)
    }, [isRecentTx, transactionState])

    const logs = useTransactionLogs(transactionState)
    if (!transaction) {
        return <Navigate to={`${PopupRoutes.Wallet}?tab=${WalletAssetTabs.Activity}`} replace />
    }

    const { FAILED, SUCCEED, NOT_DEPEND } = TransactionStatusType
    const StatusIconMap = {
        [FAILED]: <Icons.BaseClose size={20} />,
        [SUCCEED]: <Icons.FillSuccess size={20} />,
        [NOT_DEPEND]: <Icons.WarningTriangle size={20} />,
    }
    const StatusClassesMap = {
        [FAILED]: classes.statusFail,
        [SUCCEED]: classes.statusSuccess,
        [NOT_DEPEND]: classes.statusPending,
    }
    const StatusLabelMap = {
        [FAILED]: <Trans>Failed</Trans>,
        [SUCCEED]: <Trans>Success</Trans>,
        [NOT_DEPEND]: <Trans>Pending</Trans>,
    }
    const status = tx ? chainbase.normalizeTxStatus(tx.status) : transactionState?.status
    const statusPending = status === undefined && loadingTx
    const isOut = isSameAddress(transaction.from, account)
    const link = transactionId ? EVMExplorerResolver.transactionLink(chainId!, transactionId) : undefined

    const gasUsedPercent = tx ? (tx.gas_used * 100) / tx.gas : 0
    const gasFeeInState = !isRecentTx && !tx ? transactionState?.fee?.eth : undefined
    const gasFee =
        tx ? formatWeiToEther(multipliedBy(tx.gas_used, tx.effective_gas_price))
        : gasFeeInState ? new BigNumber(gasFeeInState)
        : undefined
    const gasCost = gasFee && nativeTokenPrice ? gasFee.times(nativeTokenPrice) : undefined

    const receiverAddress = parseReceiverFromERC20TransferInput(candidateState?.data || tx?.input || txInput)
    const toAddress = receiverAddress || transaction.to || tx?.to_address

    const loadingToAddress =
        transactionState?.type === 'transfer' ?
            !receiverAddress && (loadingTx || loadingTxInput)
        :   !transaction.to && loadingTx
    return (
        <>
            <Box p={2} overflow="auto" data-hide-scrollbar>
                <Box display="flex" alignItems="center">
                    <Typography variant="h2" className={classes.statusTitle}>
                        <Trans>status</Trans>
                    </Typography>
                    <ProgressiveText
                        component="div"
                        className={cx(classes.status, StatusClassesMap[status!])}
                        loading={statusPending}
                        skeletonWidth={90}>
                        {StatusIconMap[status!]}
                        {StatusLabelMap[status!]}
                    </ProgressiveText>
                </Box>
                {transactionId ?
                    <Box className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Transaction Hash</Trans>
                        </Typography>
                        <Typography className={classes.fieldValue}>
                            {formatHash(transactionId, 4)}
                            <CopyButton size={16} text={transactionId} sx={{ ml: 0.5 }} />
                        </Typography>
                    </Box>
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Link</Trans>
                    </Typography>
                    <Typography className={classes.fieldValue}>
                        <Trans>View on Explorer</Trans>
                        <Link href={link} target="_blank" ml={0.5} fontSize={0}>
                            <Icons.LinkOut size={16} color={theme.palette.maskColor.second} />
                        </Link>
                    </Typography>
                </Box>
                <Typography variant="h2" className={classes.sectionName}>
                    <Trans>Base</Trans>
                </Typography>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>From</Trans>
                    </Typography>
                    <ProgressiveText
                        className={classes.fieldValue}
                        component="div"
                        loading={!transaction.from && loadingTx}>
                        <ReversedAddress address={(transaction.from || tx?.from_address) as string} />
                    </ProgressiveText>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>To</Trans>
                    </Typography>
                    <ProgressiveText className={classes.fieldValue} component="div" loading={loadingToAddress}>
                        <ReversedAddress address={toAddress as string} />
                    </ProgressiveText>
                </Box>
                <Typography variant="h2" className={classes.sectionName}>
                    Transaction
                </Typography>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Nonce</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx?.nonce}
                    </ProgressiveText>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Amount</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx && nativeToken ?
                            `${isOut ? '-' : '+'}${formatBalance(tx.value || '0', nativeToken.decimals, {
                                significant: 6,
                            })} ${nativeToken.symbol}`
                        :   ''}
                    </ProgressiveText>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Gas Limit (Units)</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx?.gas}
                    </ProgressiveText>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Gas Used (Units)</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx?.gas_used}
                        {gasUsedPercent ? ` (${trimZero(gasUsedPercent.toFixed(1))}%)` : ''}
                    </ProgressiveText>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Gas Price (GWEI)</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {tx ? formatWeiToGwei(tx.effective_gas_price).toFixed(6) : ''}
                    </ProgressiveText>
                </Box>
                {tx?.max_priority_fee_per_gas ?
                    <Box className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Priority Fee (GWEI)</Trans>
                        </Typography>
                        <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                            {tx ? formatWeiToGwei(tx.max_priority_fee_per_gas).toFixed(6) : ''}
                        </ProgressiveText>
                    </Box>
                :   null}
                {tx?.max_fee_per_gas ?
                    <Box className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Max Fee (GWEI)</Trans>
                        </Typography>
                        <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                            {tx ? formatWeiToGwei(tx.max_fee_per_gas).toFixed(6) : ''}
                        </ProgressiveText>
                    </Box>
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Transaction Fee</Trans>
                    </Typography>
                    <ProgressiveText loading={loadingTx} className={classes.fieldValue}>
                        {gasFee ? `${gasFee.toFixed(6)} ${nativeToken?.symbol}` : ''}
                        {gasCost ?
                            <>
                                {' ≈ '}
                                <FormattedCurrency value={gasCost} formatter={formatCurrency} />
                            </>
                        :   ''}
                    </ProgressiveText>
                </Box>
                {logs.length ?
                    <>
                        <Typography variant="h2" className={classes.sectionName}>
                            <Trans>Activity Log</Trans>
                        </Typography>
                        <ol className={classes.logs}>
                            {logs.map((log, index) => (
                                <li key={index} className={classes.log}>
                                    <div className={classes.index}>{index + 1}</div>
                                    <Typography className={classes.logText}>{log}</Typography>
                                </li>
                            ))}
                        </ol>
                    </>
                :   null}
            </Box>
            {isRecentTx && status === NOT_DEPEND ?
                <Box className={classes.actionGroup}>
                    <ActionButton className={classes.speedupButton} fullWidth onClick={handleSpeedup}>
                        <Trans>Speed Up</Trans>
                    </ActionButton>
                    <ActionButton color="error" fullWidth onClick={handleCancel}>
                        <Trans>Cancel</Trans>
                    </ActionButton>
                </Box>
            :   null}
        </>
    )
})
