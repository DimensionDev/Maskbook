import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import { useState } from 'react'
import {
    useClearRecentTransactions,
    useRecentTransactions,
    useRemoveRecentTransaction,
} from '../../../plugins/Wallet/hooks'
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
        color: theme.palette.warning.main,
        fontSize: 14,
    },
    clearAll: {
        cursor: 'pointer',
        color: theme.palette.primary.main,
    },
    hide: {
        display: 'none',
    },
}))

export function usePendingTransactions() {
    const { classes } = useStyles()
    const { t } = useI18N()

    // #region recent pending transactions
    const { value: pendingTransactions = EMPTY_LIST } = useRecentTransactions({
        status: TransactionStatusType.NOT_DEPEND,
    })

    // frozenTxes would not be reactive to pendingTransactions,
    // it would be recreated then the list shows up.
    const [meltedTxHashes, setMeltedTxHashes] = useState<string[]>([])

    const clearRecentTxes = useClearRecentTransactions()
    const removeRecentTx = useRemoveRecentTransaction()

    const transactions = pendingTransactions.slice(0, 5).filter((tx) => !meltedTxHashes.includes(tx.hash))
    // #endregion
    console.log({ transactions, pendingTransactions })
    const summary = pendingTransactions.length ? (
        <section className={classes.summaryWrapper}>
            <div className={classnames(pendingTransactions.length ? '' : classes.hide)}>
                {pendingTransactions.length ? (
                    <Typography className={classes.pendingSummary} variant="body2" mr={1} fontWeight={700}>
                        {pendingTransactions.length} {t('wallet_status_pending')}
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

    const transactionList = (
        <TransactionList
            transactions={transactions}
            onClear={(tx) => {
                setMeltedTxHashes((list) => [...list, tx.hash])
                removeRecentTx(tx.hash)
            }}
        />
    )

    return { summary, transactionList }
}
