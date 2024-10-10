import {
    useClearTransactionsCallback,
    useRemoveTransactionCallback,
    useRecentTransactions,
} from '@masknet/web3-hooks-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { TransactionList } from './TransactionList.js'
import { useSharedTrans } from '../../../index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    summaryWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 1),
    },
    pendingSummary: {
        cursor: 'default',
        color: theme.palette.maskColor.warn,
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
    const { classes, cx } = useStyles()
    const t = useSharedTrans()

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
                        <Typography className={classes.pendingSummary} variant="body2" mr={1} fontWeight={700}>
                            {t.wallet_status_pending({ count: pendingTransactions.length })}
                        </Typography>
                    :   null}
                </div>
                {pendingTransactions.length ?
                    <Typography className={classes.clearAll} onClick={clearRecentTxes} fontWeight={700}>
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
