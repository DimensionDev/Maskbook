import { LoadingAnimation } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useAim } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-evm'
import { Button, Typography } from '@mui/material'
import classnames from 'classnames'
import { useMemo, useRef } from 'react'
import {
    useClearRecentTransactions,
    useRecentTransactions,
    useRemoveRecentTransaction,
} from '../../../plugins/Wallet/hooks'
import { useI18N } from '../../../utils'
import { TransactionList } from './TransactionList'

const useStyles = makeStyles()((theme) => ({
    summaryWrapper: {
        display: 'inline-block',
    },
    pendingSummary: {
        backgroundColor: 'rgba(255, 185, 21, 0.1)',
        height: 24,
        lineHeight: '22px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 4,
        padding: theme.spacing(0.5),
        boxSizing: 'border-box',
        color: theme.palette.warning.main,
        fontSize: 14,
    },
    hide: {
        display: 'none',
    },
    transactionList: {
        boxShadow: '0 0 16px rgba(101, 119, 134, 0.2)',
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
    // recentTxes would not be reactive to pendingTransactions, it would be recreated then the list shows up.
    const recentTxes = useMemo(() => pendingTransactions.slice(0, 5), [showRecentTransactions])
    const clearRecentTxes = useClearRecentTransactions()
    const removeRecentTx = useRemoveRecentTransaction()
    // #endregion
    const summary = (
        <>
            <div
                ref={pendingSummaryRef}
                className={classnames(classes.summaryWrapper, pendingTransactions.length ? '' : classes.hide)}>
                {pendingTransactions.length ? (
                    <Typography ref={pendingSummaryRef} className={classes.pendingSummary} variant="body2" mr={1}>
                        {pendingTransactions.length} {t('wallet_status_pending')}
                        <LoadingAnimation sx={{ fontSize: 16, ml: 0.5 }} />
                    </Typography>
                ) : null}
            </div>
            {pendingTransactions.length ? (
                <Button variant="text" size="small" onClick={clearRecentTxes}>
                    {t('wallet_status_pending_clear_all')}
                </Button>
            ) : null}
        </>
    )

    const transactionList = (
        <div ref={transactionsListRef} className={showRecentTransactions ? '' : classes.hide}>
            {showRecentTransactions ? (
                <TransactionList
                    className={classes.transactionList}
                    transactions={recentTxes}
                    onClear={(tx) => {
                        removeRecentTx(tx.hash)
                    }}
                />
            ) : null}
        </div>
    )

    return { summary, transactionList }
}
