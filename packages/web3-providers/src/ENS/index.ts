import type ENS from 'ethjs-ens'
import { ChainId, isEmptyHex, isZeroAddress } from '@masknet/web3-shared-evm'
import { Web3API } from '../EVM/index.js'
import type { DomainAPI } from '../entry-types.js'
import type Web3 from 'web3'

export class ENS_API implements DomainAPI.Provider<ChainId> {
    private _web3: Web3 | undefined
    private get web3() {
        return (this._web3 ??= new Web3API().createSDK(ChainId.Mainnet))
    }

    private _ens: ENS | undefined
    private async ens() {
        if (this._ens) return this._ens
        const { default: ENS } = await import('ethjs-ens')
        return (this._ens ??= new ENS({
            provider: this.web3.givenProvider,
            network: ChainId.Mainnet,
        }))
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        try {
            const { default: namehash } = await import('@ensdomains/eth-ens-namehash')
            const lookupAddress = await (await this.ens()).resolveAddressForNode(namehash.hash(name))
            return isZeroAddress(lookupAddress) || isEmptyHex(lookupAddress)
                ? this.web3.eth.ens.registry.getOwner(name)
                : lookupAddress
        } catch {
            return this.web3.eth.ens.registry.getOwner(name)
        }
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        try {
            const name = await (await this.ens()).reverse(address)
            if (!name.endsWith('.eth')) return
            return name
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'ENS name not defined.') return
            throw error
        }
    }
}
