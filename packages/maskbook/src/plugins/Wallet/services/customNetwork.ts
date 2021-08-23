import { WalletMessages } from '@masknet/plugin-wallet'
import { getNetworkTypeFromChainId } from '@masknet/web3-shared'
import { createTransaction } from '../../../database/helpers/openDB'
import type { CustomNetworkRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { CustomNetworkIntoDB, CustomNetworkOutDB } from './helpers'

function isBuiltInNetwork(chainId: number) {
    return !!getNetworkTypeFromChainId(chainId)
}

export async function getCustomNetwork(chainId: number) {
    const networks = await getCustomNetworks()
    return networks.find((x) => x.chainId === chainId.toString(16))
}

export async function getCustomNetworks() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('CustomNetwork', 'Wallet')
    const records = await t.objectStore('CustomNetwork').getAll()
    return records.map(CustomNetworkOutDB)
}

export async function addCustomNetwork(network: Omit<CustomNetworkRecord, 'createdAt' | 'updatedAt'>) {
    const chainId = Number.parseInt(network.chainId, 16)
    if (isBuiltInNetwork(chainId) || getCustomNetwork(chainId)) throw new Error(`${network.chainName} already exists.`)

    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('CustomNetwork', 'Wallet')
    await t.objectStore('CustomNetwork').put(
        CustomNetworkIntoDB({
            ...network,
            createdAt: now,
            updatedAt: now,
        }),
    )
    WalletMessages.events.customNetworkUpdated.sendToAll(undefined)
}

export async function removeCustomNetwork(chainId: number) {
    if (isBuiltInNetwork(chainId)) throw new Error('Unable to remove a built-in network.')
    const network = await getCustomNetwork(chainId)
    if (!network) return

    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('CustomNetwork', 'Wallet')
    await t.objectStore('CustomNetwork').delete(typeof chainId === 'number' ? chainId.toString(16) : chainId)
    WalletMessages.events.customNetworkUpdated.sendToAll(undefined)
}
