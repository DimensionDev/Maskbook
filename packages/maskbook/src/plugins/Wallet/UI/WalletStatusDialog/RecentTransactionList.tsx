import { ExternalLink, XCircle, RotateCcw, Check } from 'react-feather'
import { makeStyles, List, ListItem, Typography, Link, Button, Box } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { TransactionStatusType } from '../../../../web3/types'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { WalletRPC } from '../../messages'
import { useAccount } from '../../../../web3/hooks/useAccount'

const useStyles = makeStyles((theme) => ({
    transaction: {
        fontSize: 14,
        padding: 0,
        marginTop: 6,
    },
    transactionButton: {
        marginLeft: 'auto',
    },
    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
        color: '#1C68F3',
    },
}))

export interface RecentTransactionListProps {}

export function RecentTransactionList(props: RecentTransactionListProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
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
            <>
                <Typography color="textPrimary">{t('wallet_status_tip_error')}</Typography>
                <Button onClick={retry}>{t('retry')}</Button>
            </>
        )
    if (!transactions?.length) return <Typography color="textPrimary">{t('wallet_status_tip_empty')}</Typography>

    return (
        <>
            <Box>
                <Typography variant="h2">{t('plugin_wallet_recent_transaction')}</Typography>
                <Link aria-label="Clear All" component="button" onClick={onClear}>
                    ({t('plugin_wallet_clear_all')})
                </Link>
            </Box>
            <List>
                {transactions.map((transaction) => (
                    <ListItem className={classes.transaction} key={transaction.hash}>
                        <Typography variant="body2">{transaction.description}</Typography>
                        <ExternalLink className={classes.linkIcon} size={14} />
                        <Link component="button" className={classes.transactionButton}>
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
