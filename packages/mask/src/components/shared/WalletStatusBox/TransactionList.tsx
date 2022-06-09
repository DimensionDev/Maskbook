import { FC, forwardRef, useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { LinkOutIcon } from '@masknet/icons'
import { useChainId, useWeb3, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { getContractOwnerDomain } from '@masknet/web3-shared-evm'
import { Grid, GridProps, Link, List, ListItem, ListProps, Stack, Typography } from '@mui/material'
import classnames from 'classnames'
import format from 'date-fns/format'
import { noop } from 'lodash-unified'
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
        padding: theme.spacing(1, 1),
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
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    timestamp: {
        fontSize: 12,
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
    linkIcon: {
        fill: 'none',
        width: 16,
        height: 16,
        marginLeft: theme.spacing(0.5),
    },
    clear: {
        fontSize: 14,
        color: theme.palette.primary.main,
        cursor: 'pointer',
    },
}))

const statusTextColorMap: Record<TransactionStatusType, string> = {
    [TransactionStatusType.NOT_DEPEND]: '#FFB915',
    [TransactionStatusType.SUCCEED]: '#60DFAB',
    [TransactionStatusType.FAILED]: '#FF5F5F',
}
const getContractFunctionName = async (data: string | undefined) => {
    if (!data) return null
    const sig = data.slice(0, 10)
    // const name = await Services.Ethereum.getContractFunctionName(sig)
    // return name ? name.replace(/_/g, ' ') : 'Contract Interaction'
    return ''
}

interface TransactionProps extends GridProps {
    chainId: Web3Helper.ChainIdAll
    transaction: RecentTransaction<Web3Helper.ChainIdAll, Web3Helper.TransactionAll>
    onClear?(tx: RecentTransaction<Web3Helper.ChainIdAll, Web3Helper.TransactionAll>): void
}
const Transaction: FC<TransactionProps> = ({ chainId, transaction: tx, onClear = noop, ...rest }) => {
    const { t } = useI18N()
    const { classes, theme } = useStyles()

    const statusTextMap: Record<TransactionStatusType, string> = {
        [TransactionStatusType.NOT_DEPEND]: t('recent_transaction_pending'),
        [TransactionStatusType.SUCCEED]: t('recent_transaction_success'),
        [TransactionStatusType.FAILED]: t('recent_transaction_failed'),
    }

    const web3 = useWeb3()
    const { Others } = useWeb3State()

    const { value: targetAddress } = useAsync(async () => {
        return ''
        // if (tx.receipt?.contractAddress) return tx.receipt.contractAddress
        // if (tx.payload?.params?.[0].to) return tx.payload.params[0].to as string
        // const transaction = await web3?.eth.getTransaction(tx.hash)
        // return transaction.to
    }, [web3, tx])
    const address = (targetAddress || '').toLowerCase()
    // const txData = tx.payload?.params?.[0].data as string | undefined
    const { value: functionName } = useAsync(async () => {
        return ''
        // return getContractFunctionName(txData)
    }, [])

    const handleClear = useCallback(() => {
        onClear(tx)
    }, [onClear, tx])

    const domainOrAddress = useMemo(() => getContractOwnerDomain(address), [address])

    const [txStatus, setTxStatus] = useState(tx.status)

    // useEffect(() => {
    //     return WalletMessages.events.transactionStateUpdated.on((data) => {
    //         if ('receipt' in data && tx.id === data.receipt?.transactionHash) {
    //             switch (data.type) {
    //                 case TransactionStateType.CONFIRMED:
    //                     setTxStatus(TransactionStatusType.SUCCEED)
    //                     break
    //                 case TransactionStateType.FAILED:
    //                     setTxStatus(TransactionStatusType.FAILED)
    //             }
    //         }
    //     })
    // }, [tx.id])

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
                        {format(tx.createdAt, 'yyyy.MM.dd hh:mm')}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item className={classes.cell} flexGrow={1} md={4} justifyContent="right">
                <Typography variant="body1">
                    {address && isSameAddress(domainOrAddress, address)
                        ? Others?.formatAddress?.(address, 4)
                        : domainOrAddress || address}
                </Typography>
                <Link
                    className={classes.link}
                    href={Others?.explorerResolver.transactionLink?.(chainId, tx.id)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <LinkOutIcon className={classes.linkIcon} />
                </Link>
            </Grid>
            <Grid item className={classes.cell} md={2} justifyContent="center">
                <Typography fontWeight={300} justifyContent="center" color={statusTextColorMap[txStatus]}>
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
    transactions: Array<RecentTransaction<Web3Helper.ChainIdAll, Web3Helper.TransactionAll>>
    onClear?(tx: RecentTransaction<Web3Helper.ChainIdAll, Web3Helper.TransactionAll>): void
}

export const TransactionList: FC<Props> = forwardRef(({ className, transactions, onClear = noop, ...rest }, ref) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    if (!transactions.length) return null
    return (
        <List className={classnames(classes.list, className)} {...rest} ref={ref}>
            {transactions.map((tx) => (
                <ListItem key={tx.id} className={classes.listItem}>
                    <Transaction className={classes.transaction} transaction={tx} chainId={chainId} onClear={onClear} />
                </ListItem>
            ))}
        </List>
    )
})
