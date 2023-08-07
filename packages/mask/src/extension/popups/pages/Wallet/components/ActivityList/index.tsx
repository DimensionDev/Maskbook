import { ElementAnchor } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Web3 } from '@masknet/web3-providers'
import type { RecentTransaction, Transaction } from '@masknet/web3-shared-base'
import {
    ProviderType,
    type ChainId,
    type Transaction as EvmTransaction,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import { List } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GasSettingModal } from '../../../../modals/modals.js'
import { ReplaceType } from '../../type.js'
import { ActivityItem, ActivityItemSkeleton, RecentActivityItem } from './ActivityItem.js'
import { useTransactions } from './useTransactions.js'

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
    const { data: transactions, localeTxes, isFetching, fetchNextPage } = useTransactions()

    const modifyTransaction = useCallback(
        async (transaction: RecentTransaction<ChainId, EvmTransaction>, replaceType: ReplaceType) => {
            const candidate = transaction.candidates[transaction.indexId]
            if (!candidate) return
            const oldConfig = {
                gas: candidate.gas!,
                gasPrice: candidate.gasPrice,
                maxFeePerGas: candidate.maxFeePerGas,
                maxPriorityFeePerGas: candidate.maxPriorityFeePerGas,
            }
            const settings = await GasSettingModal.openAndWaitForClose({
                chainId: transaction.chainId,
                config: oldConfig,
                nonce: candidate.nonce!,
                replaceType,
            })
            if (!settings) return
            const newConfig = {
                ...oldConfig,
                ...settings,
            }
            if (replaceType === ReplaceType.CANCEL) {
                await Web3.cancelTransaction(transaction?.id, newConfig, {
                    providerType: ProviderType.MaskWallet,
                })
            } else {
                await Web3.replaceTransaction(transaction?.id, newConfig, {
                    providerType: ProviderType.MaskWallet,
                })
            }
        },
        [navigate],
    )

    const handleSpeedup = useCallback(
        async (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
            modifyTransaction(transaction, ReplaceType.SPEED_UP)
        },
        [navigate, modifyTransaction],
    )

    const handleCancel = useCallback(
        (transaction: RecentTransaction<ChainId, EvmTransaction>) => {
            modifyTransaction(transaction, ReplaceType.CANCEL)
        },
        [navigate, modifyTransaction],
    )

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
