import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../../messages'

export class AddressBookState implements Web3Plugin.ObjectCapabilities.AddressBookState {
    async getAllAddress(chainId: ChainId) {
        const addressBook = await EVM_RPC.getStorageValue('persistent', 'addressBook')
        return addressBook[chainId] ?? []
    }
    async addAddress(chainId: ChainId, address: string) {
        const addressBook = await EVM_RPC.getStorageValue('persistent', 'addressBook')
        await EVM_RPC.setStorageValue('persistent', 'addressBook', {
            ...addressBook,
            [chainId]: [...addressBook[chainId], formatEthereumAddress(address)],
        })
    }
    async removeAddress(chainId: ChainId, address: string) {
        const addressBook = await EVM_RPC.getStorageValue('persistent', 'addressBook')
        await EVM_RPC.setStorageValue('persistent', 'addressBook', {
            ...addressBook,
            [chainId]: addressBook[chainId]?.filter((x) => !isSameAddress(x, address)),
        })
    }
}
