import type { ChainId } from '@masknet/web3-shared-evm'
import type Services from '../../../../extension/service'

export interface ContractMethodInfo {
    name: string
    address: string
    chainId: ChainId
}

export type ComputedPayload = UnboxPromise<ReturnType<typeof EVM_RPC.getSendTransactionComputedPayload>>
