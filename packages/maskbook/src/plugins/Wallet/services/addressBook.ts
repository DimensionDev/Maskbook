import { uniqBy } from 'lodash-es'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { PLUGIN_IDENTIFIER } from '../constants'
import { currentChainIdSettings } from '../settings'

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

const AddressBookDB = createPluginDatabase<AddressBookChunk>(PLUGIN_IDENTIFIER)

export async function getAllAddress() {
    const chunk = await AddressBookDB.get('address-book', currentChainIdSettings.value)
    return chunk?.records ?? []
}

export async function addAddress(address: string) {
    const now = new Date()
    const address_ = formatEthereumAddress(address)
    const chunk = await AddressBookDB.get('address-book', currentChainIdSettings.value)
    await AddressBookDB.add({
        id: currentChainIdSettings.value,
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

export async function removeAddress(address: string) {
    const now = new Date()
    const chunk = await AddressBookDB.get('address-book', currentChainIdSettings.value)
    if (!chunk) return
    await AddressBookDB.add({
        id: currentChainIdSettings.value,
        type: 'address-book',
        records: chunk.records.filter((x) => !isSameAddress(x.address, address)) ?? [],
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.addressBookUpdated.sendToAll()
}
