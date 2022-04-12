import type { ChainId } from '@masknet/web3-shared-evm'

export interface ContractMethodInfo {
    name: string
    address: string
    chainId: ChainId
}
