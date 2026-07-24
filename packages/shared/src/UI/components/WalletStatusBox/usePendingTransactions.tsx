import {
    useClearTransactionsCallback,
    useRemoveTransactionCallback,
    useRecentTransactions,
} from '@masknet/web3-hooks-base'
import { makeStyles } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { TransactionList } from './TransactionList.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    summaryWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 1),
    },
    pendingSummary: {
        cursor: 'default',
        color: theme.vars.palette.maskColor.warn,
    },
    clearAll: {
        cursor: 'pointer',
        color: theme.vars.palette.maskColor.primary,
        ...theme.applyStyles('dark', { color: theme.vars.palette.common.white }),
    },
    hide: {
        display: 'none',
    },
}))

export function usePendingTransactions() {
    const { classes, cx } = useStyles()

    // #region recent pending transactions
    const pendingTransactions = useRecentTransactions(undefined, TransactionStatusType.NOT_DEPEND)

    // frozenTxes would not be reactive to pendingTransactions,
    // it would be recreated then the list shows up.
    const [meltedTxHashes, setMeltedTxHashes] = useState<string[]>([])

    const clearRecentTxes = useClearTransactionsCallback()
    const removeRecentTx = useRemoveTransactionCallback()

    const transactions = pendingTransactions.slice(0, 5).filter((tx) => !meltedTxHashes.includes(tx.id))
    // #endregion
    const summary =
        pendingTransactions.length ?
            <section className={classes.summaryWrapper}>
                <div className={cx(pendingTransactions.length ? '' : classes.hide)}>
                    {pendingTransactions.length ?
                        <Typography className={classes.pendingSummary} variant="body2" sx={{ mr: 1, fontWeight: 700 }}>
                            <Trans>{pendingTransactions.length} Pending</Trans>
                        </Typography>
                    :   null}
                </div>
                {pendingTransactions.length ?
                    <Typography className={classes.clearAll} onClick={clearRecentTxes} sx={{ fontWeight: 700 }}>
                        <Trans>Clear All</Trans>
                    </Typography>
                :   null}
            </section>
        :   null

    const transactionList =
        transactions.length > 0 ?
            <TransactionList
                transactions={transactions}
                onClear={(tx) => {
                    setMeltedTxHashes((list) => [...list, tx.id])
                    removeRecentTx(tx.id)
                }}
            />
        :   null

    return { summary, transactionList }
}
