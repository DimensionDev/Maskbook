import { Trans } from '@lingui/react/macro'
import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { RecentTransaction, Transaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { List, Typography } from '@mui/material'
import { format } from 'date-fns'
import { groupBy, range } from 'lodash-es'
import { Fragment, memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHasNavigator } from '../../../../hooks/useHasNavigator.js'
import { ReplaceType } from '../../type.js'
import { modifyTransaction } from '../../utils.js'
import { ActivityItem, ActivityItemSkeleton, RecentActivityItem } from './ActivityItem.js'
import { useTransactions } from './useTransactions.js'

const useStyles = makeStyles<{ hasNav?: boolean }>()((theme, { hasNav }) => ({
    container: {
        paddingBottom: hasNav ? 72 : undefined,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        backgroundColor: theme.vars.palette.maskColor.bottom,
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    day: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export const ActivityList = memo(function ActivityList() {
    const hasNavigator = useHasNavigator()
    const { classes } = useStyles({ hasNav: hasNavigator })
    const navigate = useNavigate()
    const { providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [{ transactions, localeTxes }, { isPending, isFetching, fetchNextPage }] = useTransactions()

    const transactionGroups = useMemo(
        () => Object.entries(groupBy(transactions, (tx) => format(tx.timestamp, 'MMM dd, yyyy'))),
        [transactions],
    )
    const localeTxGroups = useMemo(
        () => Object.entries(groupBy(localeTxes, (tx) => format(tx.createdAt, 'MMM dd, yyyy'))),
        [localeTxes],
    )

    const handleSpeedup = useCallback(
        async (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
            modifyTransaction(transaction, ReplaceType.SPEED_UP, providerType)
        },
        [providerType],
    )

    const handleCancel = useCallback(
        (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
            modifyTransaction(transaction, ReplaceType.CANCEL, providerType)
        },
        [providerType],
    )

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
            <EmptyStatus sx={{ height: '100%' }}>
                <Trans>No Data</Trans>
            </EmptyStatus>
        )

    return (
        <div className={classes.container} data-hide-scrollbar>
            <List dense className={classes.list}>
                {localeTxGroups.map(([day, txes]) => {
                    return (
                        <Fragment key={day}>
                            <Typography className={classes.day}>{day}</Typography>
                            {txes.map((transaction) => (
                                <RecentActivityItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    onSpeedup={handleSpeedup}
                                    onCancel={handleCancel}
                                    onView={handleView}
                                />
                            ))}
                        </Fragment>
                    )
                })}
                {transactionGroups.map(([day, txes]) => {
                    return (
                        <Fragment key={day}>
                            <Typography className={classes.day}>{day}</Typography>
                            {txes.map((transaction) => (
                                <ActivityItem key={transaction.id} transaction={transaction} onView={handleView} />
                            ))}
                        </Fragment>
                    )
                })}
                {isFetching ? range(4).map((i) => <ActivityItemSkeleton key={i} />) : null}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} key={transactions?.length} sx={{ height: 10 }} />
        </div>
    )
})
