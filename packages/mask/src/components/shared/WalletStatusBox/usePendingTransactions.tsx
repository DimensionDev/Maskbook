import {
    useClearTransactionsCallback,
    useRemoveTransactionCallback,
    useRecentTransactions,
} from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { TransactionList } from './TransactionList'

const useStyles = makeStyles()((theme) => ({
    summaryWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 1),
    },
    pendingSummary: {
        cursor: 'default',
        color: theme.palette.maskColor?.warn,
        fontSize: 14,
    },
    noPendingTransactions: {
        padding: theme.spacing(1, 0),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    clearAll: {
        cursor: 'pointer',
        color: theme.palette.mode === 'light' ? MaskColorVar.blue : theme.palette.common.white,
    },
    hide: {
        display: 'none',
    },
}))

export function usePendingTransactions() {
    const { classes } = useStyles()
    const { t } = useI18N()

    // #region recent pending transactions
    const pendingTransactions = useRecentTransactions(undefined, TransactionStatusType.NOT_DEPEND)

    // frozenTxes would not be reactive to pendingTransactions,
    // it would be recreated then the list shows up.
    const [meltedTxHashes, setMeltedTxHashes] = useState<string[]>([])

    const clearRecentTxes = useClearTransactionsCallback()
    const removeRecentTx = useRemoveTransactionCallback()

    const transactions = pendingTransactions.slice(0, 5).filter((tx) => !meltedTxHashes.includes(tx.id))
    // #endregion
    const summary = pendingTransactions.length ? (
        <section className={classes.summaryWrapper}>
            <div className={classnames(pendingTransactions.length ? '' : classes.hide)}>
                {pendingTransactions.length ? (
                    <Typography className={classes.pendingSummary} variant="body2" mr={1} fontWeight={700}>
                        {pendingTransactions.length}{' '}
                        {t('wallet_status_pending', {
                            plural: pendingTransactions.length > 1 ? 's' : '',
                        })}
                    </Typography>
                ) : null}
            </div>
            {pendingTransactions.length ? (
                <Typography className={classes.clearAll} onClick={clearRecentTxes} fontWeight={700}>
                    {t('wallet_status_pending_clear_all')}
                </Typography>
            ) : null}
        </section>
    ) : null

    const transactionList =
        transactions.length > 0 ? (
            <TransactionList
                transactions={transactions}
                onClear={(tx) => {
                    setMeltedTxHashes((list) => [...list, tx.id])
                    removeRecentTx(tx.id)
                }}
            />
        ) : (
            <Typography className={classes.noPendingTransactions}>
                {t('wallet_status_no_pending_transactions')}
            </Typography>
        )

    return { summary, transactionList }
}
