import ENS from 'ethjs-ens'
import type { HttpProvider } from 'web3-core'
import namehash from '@ensdomains/eth-ens-namehash'
import { ChainId, createWeb3Provider, createWeb3Request, isEmptyHex, isZeroAddress } from '@masknet/web3-shared-evm'
import { Web3API } from '../EVM/index.js'
import type { DomainAPI } from '../entry-types.js'

export class ENS_API implements DomainAPI.Provider<ChainId> {
    private get web3() {
        return new Web3API().createSDK(ChainId.Mainnet)
    }

    private get ens() {
        const provider = this.web3.currentProvider as HttpProvider
        return new ENS({
            provider: createWeb3Provider(createWeb3Request(provider.send.bind(provider))),
            network: ChainId.Mainnet,
        })
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        try {
            const lookupAddress = await this.ens.resolveAddressForNode(namehash.hash(name))
            return isZeroAddress(lookupAddress) || isEmptyHex(lookupAddress)
                ? this.web3.eth.ens.registry.getOwner(name)
                : lookupAddress
        } catch {
            return this.web3.eth.ens.registry.getOwner(name)
        }
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        try {
            const name = await this.ens.reverse(address)
            if (!name.endsWith('.eth')) return
            return name
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'ENS name not defined.') return
            throw error
        }
    }
}
