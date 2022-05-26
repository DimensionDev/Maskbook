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
    noPendingTransactions: {
        padding: theme.spacing(1, 0),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
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
    const _t = [
        {
            at: new Date('2022-05-26T07:23:08.707Z'),
            hash: '0x380187d60d5fda87aba9abc795847ed2ffd0ea7bf6850cbab9954993493a4ac7',
            payload: {
                jsonrpc: '2.0',
                id: 1692,
                params: [
                    {
                        from: '0x7719fd6a5a951746c8c26e3dfd143f6b96db6412',
                        to: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
                        data: '0x7ff36ab5000000000000000000000000000000000000000000000000000c8ae965dfcefb00000000000000000000000000000000000000000000000000000000000000800000000000000000000000007719fd6a5a951746c8c26e3dfd143f6b96db641200000000000000000000000000000000000000000000000000000000c51e56aa00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000002b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
                        gas: '0x47205',
                        value: '0x2386f26fc10000',
                        maxPriorityFeePerGas: '0x7adc2dd00',
                        maxFeePerGas: '0x7adc2dd1b',
                        chainId: 137,
                    },
                ],
                method: 'eth_sendTransaction',
            },
            status: 0,
        },
    ]
    const transactionList =
        _t.length > 0 ? (
            <TransactionList
                transactions={_t}
                onClear={(tx) => {
                    setMeltedTxHashes((list) => [...list, tx.hash])
                    removeRecentTx(tx.hash)
                }}
            />
        ) : (
            <Typography className={classes.noPendingTransactions}>
                {t('wallet_status_no_pending_transactions')}
            </Typography>
        )

    return { summary, transactionList }
}
