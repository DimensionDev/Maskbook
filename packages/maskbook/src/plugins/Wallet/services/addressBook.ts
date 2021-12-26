import { uniqBy } from 'lodash-es'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'
import { PluginDB } from '../database/Plugin.db'

const MAX_ADDRESS_BOOK_SIZE = 20

export interface Record {
    name: string
    address: string
}

export interface AddressBookChunk {
    id: ChainId
    type: 'address-book'
    records: Record[]
    createdAt: Date
    updatedAt: Date
}

export async function getAllAddress(chainId: ChainId) {
    const chunk = await PluginDB.get('address-book', chainId)
    return chunk?.records ?? []
}

export async function addAddress(chainId: ChainId, address: string) {
    const now = new Date()
    const address_ = formatEthereumAddress(address)
    const chunk = await PluginDB.get('address-book', chainId)
    await PluginDB.add({
        id: chainId,
        type: 'address-book',
        records: uniqBy(
            [
                {
                    name: address_,
                    address: address_,
                },
                // place old address last
                ...(chunk?.records ?? []),
            ],
            (x) => x.address,
        ).slice(0, MAX_ADDRESS_BOOK_SIZE),
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.addressBookUpdated.sendToAll()
}

export async function removeAddress(chainId: ChainId, address: string) {
    const now = new Date()
    const chunk = await PluginDB.get('address-book', chainId)
    if (!chunk) return
    await PluginDB.add({
        id: chainId,
        type: 'address-book',
        records: chunk.records.filter((x) => !isSameAddress(x.address, address)) ?? [],
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.addressBookUpdated.sendToAll()
}
