import { EMPTY_LIST } from '@masknet/shared-base'
import { useAim } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import {
    useClearRecentTransactions,
    useRecentTransactions,
    useRemoveRecentTransaction,
} from '../../../plugins/Wallet/hooks'
import type { RecentTransaction } from '../../../plugins/Wallet/services'
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
    const pendingSummaryRef = useRef<HTMLDivElement>(null)
    const transactionsListRef = useRef<HTMLDivElement>(null)
    const showRecentTransactions = useAim(pendingSummaryRef, transactionsListRef)

    // #region recent pending transactions
    const { value: pendingTransactions = EMPTY_LIST } = useRecentTransactions({
        status: TransactionStatusType.NOT_DEPEND,
    })

    // frozenTxes would not be reactive to pendingTransactions,
    // it would be recreated then the list shows up.
    const frozenTxes = useRef<RecentTransaction[]>([])
    const [meltedTxHashes, setMeltedTxHashes] = useState<string[]>([])
    useEffect(() => {
        frozenTxes.current = pendingTransactions.slice(0, 5)
        setMeltedTxHashes([])
    }, [showRecentTransactions])
    const clearRecentTxes = useClearRecentTransactions()
    const removeRecentTx = useRemoveRecentTransaction()

    const transactions = frozenTxes.current.filter((tx) => !meltedTxHashes.includes(tx.hash))
    // #endregion

    const summary = pendingTransactions.length ? (
        <section className={classes.summaryWrapper}>
            <div ref={pendingSummaryRef} className={classnames(pendingTransactions.length ? '' : classes.hide)}>
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
        <div ref={transactionsListRef} className={showRecentTransactions ? '' : classes.hide}>
            <TransactionList
                transactions={transactions}
                onClear={(tx) => {
                    setMeltedTxHashes((list) => [...list, tx.hash])
                    removeRecentTx(tx.hash)
                }}
            />
        </div>
    )

    return { summary, transactionList }
}
