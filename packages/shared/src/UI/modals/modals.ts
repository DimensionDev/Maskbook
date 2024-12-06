import { SingletonModal } from '@masknet/shared-base'
import type { SelectNonFungibleContractModalOpenProps } from './SelectNonFungibleContractModal/index.js'
import type { TransactionConfirmModalOpenProps } from './TokenTransactionConfirmModal/index.js'

export const TransactionConfirmModal = new SingletonModal<TransactionConfirmModalOpenProps>()
export const SelectNonFungibleContractModal = new SingletonModal<SelectNonFungibleContractModalOpenProps>()
