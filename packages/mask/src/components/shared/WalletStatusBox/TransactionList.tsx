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
import { Button, Grid, GridProps, Link, List, ListItem, ListProps, Stack, Typography } from '@mui/material'
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
        height: 54,
        backgroundColor: theme.palette.background.paper,
        '&:nth-child(even)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    transaction: {
        width: '100%',
    },
    methodName: {
        fontWeight: 'bold',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    cell: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 0.5),
        color: theme.palette.text.primary,
        boxSizing: 'border-box',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    link: {
        fill: 'none',
    },
    linkIcon: {
        fill: 'none',
        width: 12,
        height: 12,
        marginLeft: theme.spacing(0.5),
    },
}))

const statusTextColorMap: Record<TransactionStatusType, string> = {
    [TransactionStatusType.NOT_DEPEND]: '#FFB915',
    [TransactionStatusType.SUCCEED]: '#60DFAB',
    [TransactionStatusType.FAILED]: '#FF5F5F',
    [TransactionStatusType.CANCELLED]: '#FF5F5F',
}
const statusTextMap: Record<TransactionStatusType, string> = {
    [TransactionStatusType.NOT_DEPEND]: 'Pending',
    [TransactionStatusType.SUCCEED]: 'Success',
    [TransactionStatusType.FAILED]: 'Failed',
    [TransactionStatusType.CANCELLED]: 'Cancelled',
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

    const domain = useMemo(() => getContractOwnerDomain(address), [address])

    const [txStatus, setTxStatus] = useState(tx.status)

    useEffect(() => {
        return WalletMessages.events.transactionStateUpdated.on((data) => {
            switch (data.type) {
                case TransactionStateType.CONFIRMED:
                    if (tx.hash === data.receipt.transactionHash) {
                        setTxStatus(TransactionStatusType.SUCCEED)
                    }
                    break
                case TransactionStateType.FAILED:
                    if (tx.hash === data.receipt?.transactionHash) {
                        setTxStatus(TransactionStatusType.FAILED)
                    }
            }
        })
    }, [tx.hash])

    return (
        <Grid container {...rest}>
            <Grid item className={classes.cell} textAlign="left" md={4}>
                <Stack>
                    <Typography
                        className={classes.methodName}
                        title={functionName || ''}
                        variant="body1"
                        component="strong">
                        {functionName}
                    </Typography>
                    <Typography variant="body1" color={theme.palette.text.secondary}>
                        {format(tx.at, 'yyyy.MM.dd hh:mm')}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item className={classes.cell} flexGrow={1} md={4} justifyContent="right">
                <Typography variant="body1">
                    {address && isSameAddress(domain, address) ? Utils?.formatAddress?.(address, 4) : domain || address}
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
                <Typography justifyContent="center" color={statusTextColorMap[txStatus]}>
                    {statusTextMap[txStatus]}
                </Typography>
            </Grid>
            <Grid item className={classes.cell} md={2} justifyContent="center">
                {txStatus === TransactionStatusType.NOT_DEPEND ? (
                    <Button variant="text" size="small" onClick={handleClear}>
                        {t('wallet_status_pending_clear')}
                    </Button>
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
