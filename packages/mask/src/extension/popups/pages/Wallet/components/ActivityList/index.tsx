import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { RecentTransaction, Transaction } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction as EvmTransaction, type SchemaType } from '@masknet/web3-shared-evm'
import { List } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReplaceType } from '../../type.js'
import { ActivityItem, ActivityItemSkeleton, RecentActivityItem } from './ActivityItem.js'
import { useTransactions } from './useTransactions.js'
import { modifyTransaction } from '../../utils.js'
import { useI18N } from '../../../../../../utils/i18n-next-ui.js'

const useStyles = makeStyles()((theme) => ({
    list: {
        backgroundColor: '#ffffff',
        padding: theme.spacing(2),
    },
    item: {
        '&:not(:last-of-type)': {
            marginBottom: theme.spacing(1.5),
        },
    },
}))

export interface ActivityListProps {}

export const ActivityList = memo<ActivityListProps>(function ActivityList() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { data: transactions, localeTxes, isLoading, isFetching, fetchNextPage } = useTransactions()

    const handleSpeedup = useCallback(async (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
        modifyTransaction(transaction, ReplaceType.SPEED_UP)
    }, [])

    const handleCancel = useCallback((transaction: RecentTransaction<ChainId, EvmTransaction>) => {
        modifyTransaction(transaction, ReplaceType.CANCEL)
    }, [])

    const handleView = useCallback(
        (transaction: Transaction<ChainId, SchemaType> | RecentTransaction<ChainId, EvmTransaction>) => {
            navigate(PopupRoutes.TransactionDetail, {
                // No available API to fetch a transaction info yet.
                // Just pass target transaction to the detail page.
                state: { transaction },
            })
        },
        [navigate],
    )

    if (isLoading && !localeTxes.length && !transactions.length)
        return <EmptyStatus height="100%">{t('no_data')}</EmptyStatus>

    return (
        <>
            <List dense className={classes.list}>
                {localeTxes.map((transaction) => (
                    <RecentActivityItem
                        key={transaction.id}
                        transaction={transaction}
                        onSpeedup={handleSpeedup}
                        onCancel={handleCancel}
                        onView={handleView}
                    />
                ))}
                {transactions.map((transaction) => (
                    <ActivityItem
                        key={transaction.id}
                        className={classes.item}
                        transaction={transaction}
                        onView={handleView}
                    />
                ))}
                {isFetching ? range(4).map((i) => <ActivityItemSkeleton key={i} className={classes.item} />) : null}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} key={transactions.length} height={10} />
        </>
    )
})
