import { ExternalLink, XCircle, RotateCcw, Check } from 'react-feather'
import { makeStyles, List, ListItem, Typography, Link, Button } from '@material-ui/core'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { TransactionStatusType } from '../../../../web3/types'

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

    const { value: transactions, error, retry } = useRecentTransactions()

    if (error)
        return (
            <>
                <Typography color="textPrimary">{t('wallet_status_tip_error')}</Typography>
                <Button onClick={retry}>{t('retry')}</Button>
            </>
        )
    if (!transactions?.length) return <Typography color="textPrimary">{t('wallet_status_tip_empty')}</Typography>

    return (
        <List>
            {transactions.map((transaction) => (
                <ListItem className={classes.transaction}>
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
    )
}
