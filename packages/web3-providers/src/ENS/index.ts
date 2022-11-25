import ENS from 'ethjs-ens'
import namehash from '@ensdomains/eth-ens-namehash'
import { ChainId, isEmptyHex, isZeroAddress } from '@masknet/web3-shared-evm'
import type { DomainAPI } from '../index.js'
import { Web3API } from '../EVM/index.js'

export class ENS_API implements DomainAPI.Provider<ChainId> {
    private web3 = new Web3API().createSDK(ChainId.Mainnet)
    private ens = new ENS({
        provider: this.web3.givenProvider,
        network: ChainId.Mainnet,
    })

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
