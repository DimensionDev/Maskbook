import type { TransactionState } from '@masknet/web3-shared-evm'

export type TipTuple = [state: TransactionState, sendTip: () => Promise<void>]
