import { PersistentStorages, type StorageObject } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { isLocked, sdk_EIP2255_wallet_getPermissions } from './index.js'
import { isSameAddress } from '@masknet/web3-shared-base'

let storage: StorageObject<{
    chainId: ChainId
    account: string
}>
async function initStorage() {
    // from packages/web3-providers/src/Web3/EVM/providers/BaseHosted.ts
    storage ??= PersistentStorages.Web3.createSubScope('com.mask.evm_Maskbook_hosted', {
        chainId: ChainId.Aurora_Testnet,
        account: '',
    }).storage
    await storage.chainId.initializedPromise
    await storage.account.initializedPromise
    return storage
}

export async function sdk_eth_accounts(origin: string): Promise<string[]> {
    if (await isLocked()) return []
    const wallets = await sdk_getGrantedWallets(origin)
    const currentAccount = (await initStorage()).account.value
    return wallets.sort((a, b) =>
        isSameAddress(a, currentAccount) ? -1
        : isSameAddress(b, currentAccount) ? 1
        : 0,
    )
}
export async function sdk_eth_chainId(): Promise<ChainId> {
    return (await initStorage()).chainId.value
}

export async function sdk_getGrantedWallets(origin: string) {
    const wallets: string[] = []
    for (const permission of await sdk_EIP2255_wallet_getPermissions(origin)) {
        if (permission.parentCapability !== 'eth_accounts') continue
        for (const caveat of permission.caveats) {
            if (caveat.type !== 'restrictReturnedAccounts') continue
            if (!Array.isArray(caveat.value)) continue
            for (const item of caveat.value) {
                if (typeof item === 'string') wallets.push(item)
            }
        }
    }
    return wallets
}
