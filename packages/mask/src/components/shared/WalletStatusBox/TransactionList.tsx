import { LinkOutIcon } from '@masknet/icons'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    getContractOwnerDomain,
    isSameAddress,
    TransactionStateType,
    TransactionStatusType,
    useChainId,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { Grid, GridProps, Link, List, ListItem, ListProps, Stack, Typography } from '@mui/material'
import classnames from 'classnames'
import format from 'date-fns/format'
import { noop } from 'lodash-unified'
import { FC, forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import type { RecentTransaction } from '../../../plugins/Wallet/services/transaction'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    list: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        padding: 0,
    },
    listItem: {
        height: 52,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1, 1),
        '&:nth-child(even)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    transaction: {
        width: '100%',
    },
    methodName: {
        fontWeight: 500,
        fontSize: 14,
        textTransform: 'capitalize',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
    },
    timestamp: {
        fontSize: 14,
        lineHeight: '18px',
    },
    cell: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.primary,
        boxSizing: 'border-box',
    },
    link: {
        display: 'flex',
        fill: 'none',
    },
    linkText: {
        lineHeight: '18px',
        transform: 'translateY(-2px)',
    },
    linkIcon: {
        fill: 'none',
        width: 17.5,
        height: 17.5,
        marginLeft: theme.spacing(0.5),
    },
    clear: {
        fontSize: 14,
        color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.common.white,
        cursor: 'pointer',
    },
}))

const statusTextColorMap: Record<TransactionStatusType, string> = {
    [TransactionStatusType.NOT_DEPEND]: '#FFB915',
    [TransactionStatusType.SUCCEED]: '#60DFAB',
    [TransactionStatusType.FAILED]: '#FF5F5F',
    [TransactionStatusType.CANCELLED]: '#FF5F5F',
}
const getContractFunctionName = async (data: string | undefined) => {
    if (!data) return null
    const sig = data.slice(0, 10)
    const name = await Services.Ethereum.getContractFunctionName(sig)
    return name ? name.replace(/_/g, ' ') : 'Contract Interaction'
}

interface TransactionProps extends GridProps {
    chainId: ChainId
    transaction: RecentTransaction
    onClear?(tx: RecentTransaction): void
}
const Transaction: FC<TransactionProps> = ({ chainId, transaction: tx, onClear = noop, ...rest }) => {
    const { t } = useI18N()
    const { Utils } = useWeb3State()
    const { classes, theme } = useStyles()

    const statusTextMap: Record<TransactionStatusType, string> = {
        [TransactionStatusType.NOT_DEPEND]: t('recent_transaction_pending'),
        [TransactionStatusType.SUCCEED]: t('recent_transaction_success'),
        [TransactionStatusType.FAILED]: t('recent_transaction_failed'),
        [TransactionStatusType.CANCELLED]: t('recent_transaction_cancelled'),
    }

    const web3 = useWeb3()
    const { value: targetAddress } = useAsync(async () => {
        if (tx.receipt?.contractAddress) return tx.receipt.contractAddress
        if (tx.payload?.params?.[0].to) return tx.payload.params[0].to as string
        const transaction = await web3.eth.getTransaction(tx.hash)
        return transaction.to
    }, [web3, tx])
    const address = (targetAddress || '').toLowerCase()
    const txData = tx.payload?.params?.[0].data as string | undefined
    const { value: functionName } = useAsync(async () => {
        return getContractFunctionName(txData)
    }, [txData])

    const handleClear = useCallback(() => {
        onClear(tx)
    }, [onClear, tx])

    const domainOrAddress = useMemo(() => getContractOwnerDomain(address), [address])

    const [txStatus, setTxStatus] = useState(tx.status)

    useEffect(() => {
        return WalletMessages.events.transactionStateUpdated.on((data) => {
            if ('receipt' in data && tx.hash === data.receipt?.transactionHash) {
                switch (data.type) {
                    case TransactionStateType.CONFIRMED:
                        setTxStatus(TransactionStatusType.SUCCEED)
                        break
                    case TransactionStateType.FAILED:
                        setTxStatus(TransactionStatusType.FAILED)
                }
            }
        })
    }, [tx.hash])

    return (
        <Grid container {...rest}>
            <Grid item className={classes.cell} textAlign="left" md={4}>
                <Stack overflow="hidden">
                    <Typography
                        className={classes.methodName}
                        title={functionName || ''}
                        variant="body1"
                        fontWeight={500}>
                        {functionName}
                    </Typography>
                    <Typography className={classes.timestamp} variant="body1" color={theme.palette.text.secondary}>
                        {format(tx.at, 'yyyy.MM.dd hh:mm')}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item className={classes.cell} flexGrow={1} md={4} justifyContent="right">
                <Typography variant="body1" className={classes.linkText}>
                    {address && isSameAddress(domainOrAddress, address)
                        ? Utils?.formatAddress?.(address, 4)
                        : domainOrAddress || address}
                </Typography>
                <Link
                    className={classes.link}
                    href={Utils?.resolveTransactionLink?.(chainId, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <LinkOutIcon className={classes.linkIcon} />
                </Link>
            </Grid>
            <Grid item className={classes.cell} md={2} justifyContent="center">
                <Typography fontWeight={300} justifyContent="center" color={statusTextColorMap[txStatus]} fontSize={14}>
                    {statusTextMap[txStatus]}
                </Typography>
            </Grid>
            <Grid item className={classes.cell} md={2} justifyContent="right">
                {txStatus === TransactionStatusType.NOT_DEPEND ? (
                    <Typography fontWeight={300} className={classes.clear} onClick={handleClear}>
                        {t('wallet_status_pending_clear')}
                    </Typography>
                ) : null}
            </Grid>
        </Grid>
    )
}

interface Props extends ListProps {
    transactions: RecentTransaction[]
    onClear?(tx: RecentTransaction): void
}

export const TransactionList: FC<Props> = forwardRef(({ className, transactions, onClear = noop, ...rest }, ref) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    if (!transactions.length) return null
    return (
        <List className={classnames(classes.list, className)} {...rest} ref={ref}>
            {transactions.map((tx) => (
                <ListItem key={tx.hash} className={classes.listItem}>
                    <Transaction className={classes.transaction} transaction={tx} chainId={chainId} onClear={onClear} />
                </ListItem>
            ))}
        </List>
    )
})
