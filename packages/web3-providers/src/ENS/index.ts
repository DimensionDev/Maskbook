import ENS from 'ethjs-ens'
import namehash from '@ensdomains/eth-ens-namehash'
import { ChainId, isEmptyHex, isZeroAddress } from '@masknet/web3-shared-evm'
import { Web3API } from '../EVM/index.js'
import type { DomainAPI } from '../entry-types.js'

export class ENS_API implements DomainAPI.Provider<ChainId> {
    private web3 = new Web3API()

    private get eth() {
        return this.web3.getWeb3(ChainId.Mainnet).eth
    }

    private get ens() {
        const provider = this.web3.getWeb3Provider(ChainId.Mainnet)
        return new ENS({
            provider,
            network: ChainId.Mainnet,
        })
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        try {
            const lookupAddress = await this.ens.resolveAddressForNode(namehash.hash(name))
            return isZeroAddress(lookupAddress) || isEmptyHex(lookupAddress)
                ? this.eth.ens.registry.getOwner(name)
                : lookupAddress
        } catch {
            return this.eth.ens.registry.getOwner(name)
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
