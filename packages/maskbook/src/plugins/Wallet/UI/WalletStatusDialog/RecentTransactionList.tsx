import { ExternalLink, XCircle, RotateCcw, Check } from 'react-feather'
import { makeStyles, List, ListItem, Typography, Link, Button, Box } from '@material-ui/core'
import { formatKeccakHash } from '@dimensiondev/maskbook-shared'
import {
    useAccount,
    useChainId,
    TransactionStatusType,
    resolveTransactionLinkOnExplorer,
} from '@dimensiondev/web3-shared'
import { useI18N } from '../../../../utils'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { WalletRPC } from '../../messages'

const useStyles = makeStyles((theme) => ({
    transaction: {
        fontSize: 14,
        padding: 0,
        marginTop: 6,
    },
    transactionButton: {
        marginLeft: 'auto',
    },
    title: {
        marginRight: theme.spacing(1),
    },
    link: {
        color: theme.palette.text.secondary,
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
        async (ev) => {
            await WalletRPC.clearRecentTransactions(account)
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
                            href={resolveTransactionLinkOnExplorer(chainId, transaction.hash)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <ExternalLink className={classes.linkIcon} size={14} />
                        </Link>
                        <Link className={classes.transactionButton} component="button">
                            {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                                <RotateCcw size={14} />
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
