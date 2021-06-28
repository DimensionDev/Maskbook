import { Check, XCircle } from 'react-feather'
import { Box, Button, CircularProgress, Link, List, ListItem, makeStyles, Typography } from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import {
    formatKeccakHash,
    resolveTransactionLinkOnExplorer,
    TransactionStatusType,
    useAccount,
    useChainId,
} from '@masknet/web3-shared'
import { useI18N } from '../../../../utils'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { WalletRPC } from '../../messages'

const useStyles = makeStyles((theme) => ({
    transaction: {
        fontSize: 14,
        padding: 0,
        marginTop: 6,
        display: 'flex',
        alignItems: 'center',
    },
    transactionButton: {
        marginLeft: 'auto',
    },
    title: {
        marginRight: theme.spacing(1),
    },
    link: {
        display: 'inherit',
        fontSize: 14,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
}))

export interface RecentTransactionListProps {}

export function RecentTransactionList(props: RecentTransactionListProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainId = useChainId()
    const { value: transactions, error, retry } = useRecentTransactions()

    //#region clear the most recent transactions
    const onClear = useSnackbarCallback(
        async () => {
            await WalletRPC.clearRecentTransactions(account)
            retry()
        },
        [],
        undefined,
        undefined,
        undefined,
        t('done'),
    )
    //#endregion

    if (error)
        return (
            <Box display="flex" alignItems="center">
                <Typography color="textPrimary" sx={{ marginRight: 1 }}>
                    {t('wallet_status_tip_error')}
                </Typography>
                <Button onClick={retry}>{t('retry')}</Button>
            </Box>
        )
    if (!transactions?.length) return <Typography color="textPrimary">{t('wallet_status_tip_empty')}</Typography>

    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography color="textPrimary">{t('plugin_wallet_recent_transaction')}</Typography>
                <Link aria-label="Clear All" component="button" onClick={onClear}>
                    ({t('plugin_wallet_clear_all')})
                </Link>
            </Box>
            <List>
                {transactions.map((transaction) => (
                    <ListItem className={classes.transaction} key={transaction.hash}>
                        <Typography className={classes.title} variant="body2">
                            {formatKeccakHash(transaction.hash, 6)}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={resolveTransactionLinkOnExplorer(chainId, transaction.hash)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <OpenInNewIcon className={classes.linkIcon} fontSize="inherit" />
                        </Link>
                        <Link className={classes.transactionButton} component="button">
                            {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                                <CircularProgress size={14} color="primary" />
                            ) : transaction.status === TransactionStatusType.SUCCEED ? (
                                <Check size={14} color="#77E0B5" />
                            ) : (
                                <XCircle size={14} color="#FF5555" />
                            )}
                        </Link>
                    </ListItem>
                ))}
            </List>
        </>
    )
}
