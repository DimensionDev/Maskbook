import type { RecentTransaction, Transaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction, SchemaType } from '@masknet/web3-shared-evm'

export type TransactionState = Transaction<ChainId, SchemaType> | RecentTransaction<ChainId, EvmTransaction> | undefined
