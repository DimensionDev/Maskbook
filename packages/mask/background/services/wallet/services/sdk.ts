import { PersistentStorages, type StorageObject } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

let storage: StorageObject<{
    chainId: ChainId
}>
export async function sdk_eth_chainId(): Promise<ChainId> {
    // from packages/web3-providers/src/Web3/EVM/providers/BaseHosted.ts
    storage ??= PersistentStorages.Web3.createSubScope('com.mask.evm_Maskbook_hosted', {
        chainId: ChainId.Aurora_Testnet,
    }).storage
    await storage.chainId.initializedPromise
    return storage.chainId.value
}
