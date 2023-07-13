import { ElementAnchor } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-hooks-base'
import { DeBankHistory } from '@masknet/web3-providers'
import type { Transaction } from '@masknet/web3-shared-evm'
import { List } from '@mui/material'
import { useInfiniteQuery } from '@tanstack/react-query'
import { range } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { ReplaceType } from '../../type.js'
import { ActivityListItem, ActivityListItemSkeleton } from './ActivityListItem.js'

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
    const { classes } = useStyles()
    const navigate = useNavigate()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { data, isFetching, fetchNextPage } = useInfiniteQuery({
        queryKey: ['debank', 'all-history', account],
        queryFn: async ({ pageParam }) => {
            return DeBankHistory.getAllTransactions(account, { indicator: pageParam })
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })
    const transactions = useMemo(() => data?.pages.flatMap((p) => p.data) || EMPTY_LIST, [data?.pages])

    const handleSpeedup = useCallback(
        (transaction: Transaction) => {
            navigate(
                urlcat(PopupRoutes.ReplaceTransaction, {
                    type: ReplaceType.SPEED_UP,
                }),
                {
                    state: { transaction },
                },
            )
        },
        [navigate],
    )

    const handleCancel = useCallback(
        (transaction: Transaction) => {
            navigate(
                urlcat(PopupRoutes.ReplaceTransaction, {
                    type: ReplaceType.CANCEL,
                }),
                {
                    state: { transaction },
                },
            )
        },
        [navigate],
    )

    const handleView = useCallback(
        (transaction: Transaction) => {
            navigate(PopupRoutes.TransactionDetail, {
                // No available API to fetch a transaction info yet.
                // Just pass target transaction to the detail page.
                state: { transaction },
            })
        },
        [navigate],
    )

    return (
        <>
            <List dense className={classes.list}>
                {transactions.map((transaction) => (
                    <ActivityListItem
                        key={transaction.id}
                        className={classes.item}
                        transaction={transaction}
                        onSpeedup={handleSpeedup}
                        onCancel={handleCancel}
                        onView={handleView}
                    />
                ))}
                {isFetching ? range(4).map((i) => <ActivityListItemSkeleton key={i} className={classes.item} />) : null}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} key={transactions.length} height={10} />
        </>
    )
})
