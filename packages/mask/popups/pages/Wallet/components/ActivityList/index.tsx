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
import { useHasNavigator } from '../../../../hooks/useHasNavigator.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{ hasNav?: boolean }>()((theme, { hasNav }) => ({
    container: {
        paddingBottom: hasNav ? 72 : undefined,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        backgroundColor: theme.palette.maskColor.bottom,
        padding: theme.spacing(2),
    },
    item: {
        '&:not(:last-of-type)': {
            marginBottom: theme.spacing(1.5),
        },
    },
}))

export const ActivityList = memo(function ActivityList() {
    const hasNavigator = useHasNavigator()
    const { classes } = useStyles({ hasNav: hasNavigator })
    const navigate = useNavigate()
    const [{ transactions, localeTxes }, { isPending, isFetching, fetchNextPage }] = useTransactions()

    const handleSpeedup = useCallback(async (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
        modifyTransaction(transaction, ReplaceType.SPEED_UP)
    }, [])

    const handleCancel = useCallback((transaction: RecentTransaction<ChainId, EvmTransaction>) => {
        modifyTransaction(transaction, ReplaceType.CANCEL)
    }, [])

    const handleView = useCallback(
        (
            transaction: Transaction<ChainId, SchemaType> | RecentTransaction<ChainId, EvmTransaction>,
            candidate?: EvmTransaction,
        ) => {
            navigate(PopupRoutes.TransactionDetail, {
                // No available API to fetch a transaction info yet.
                // Just pass target transaction to the detail page.
                state: { transaction, candidate },
            })
        },
        [navigate],
    )

    if (!isPending && !localeTxes.length && !transactions?.length)
        return (
            <EmptyStatus height="100%">
                <Trans>No Data</Trans>
            </EmptyStatus>
        )

    return (
        <div className={classes.container} data-hide-scrollbar>
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
                {transactions?.map((transaction) => (
                    <ActivityItem
                        key={transaction.id}
                        className={classes.item}
                        transaction={transaction}
                        onView={handleView}
                    />
                ))}
                {isFetching ? range(4).map((i) => <ActivityItemSkeleton key={i} className={classes.item} />) : null}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} key={transactions?.length} height={10} />
        </div>
    )
})
