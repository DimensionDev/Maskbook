import { first, memoize } from 'lodash-es'
import Web3SDK from 'web3'
import type { HttpProvider } from 'web3-core'
import {
    AddressType,
    ChainId,
    createWeb3Provider,
    createWeb3Request,
    getRPCConstants,
    isValidAddress,
    Web3Provider,
} from '@masknet/web3-shared-evm'
import type { Web3BaseAPI } from '../../entry-types.js'

const createWeb3SDK = memoize(
    (url: string) => new Web3SDK(url),
    (url) => url.toLowerCase(),
)

export class Web3API implements Web3BaseAPI.Provider<ChainId, AddressType, Web3Provider, Web3SDK> {
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.createWeb3(chainId).eth.getCode(address)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }

    createWeb3(chainId: ChainId) {
        const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
        if (!RPC_URL) throw new Error('Failed to create web3 provider.')
        return createWeb3SDK(RPC_URL)
    }

    createProvider(chainId: ChainId) {
        const web3 = this.createWeb3(chainId)
        const provider = web3.currentProvider as HttpProvider
        return createWeb3Provider(createWeb3Request(provider.send))
    }
}
