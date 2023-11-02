import { type RecentTransaction, type Transaction } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction as EvmTransaction, type SchemaType } from '@masknet/web3-shared-evm'

export type TransactionState = Transaction<ChainId, SchemaType> | RecentTransaction<ChainId, EvmTransaction> | undefined
