import ENS from 'ethjs-ens'
import namehash from '@ensdomains/eth-ens-namehash'
import { ChainId, ProviderType, isZeroAddress, isEmptyHex } from '@masknet/web3-shared-evm'
import type { NameServiceResolver } from '@masknet/plugin-infra/web3'
import { Web3StateSettings } from '../../settings/index.js'
import { Providers } from '../Connection/provider.js'

export class ENS_Resolver implements NameServiceResolver<ChainId> {
    private ens: ENS | null = null

    private async createENS() {
        if (this.ens) return this.ens
        const provider = await Providers[ProviderType.MaskWallet].createWeb3Provider({
            chainId: ChainId.Mainnet,
        })
        this.ens = new ENS({
            provider,
            network: ChainId.Mainnet,
        })
        return this.ens
    }

    async lookup(chainId: ChainId, name: string) {
        if (chainId !== ChainId.Mainnet) return
        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId,
        })

        try {
            const ens = await this.createENS()
            const lookupAddress = await ens.resolveAddressForNode(namehash.hash(name))
            return isZeroAddress(lookupAddress) || isEmptyHex(lookupAddress)
                ? web3?.eth.ens.registry.getOwner(name)
                : lookupAddress
        } catch {
            return web3?.eth.ens.registry.getOwner(name)
        }
    }

    async reverse(chainId: ChainId, address: string) {
        if (chainId !== ChainId.Mainnet) return

        try {
            const ens = await this.createENS()
            const name = await ens.reverse(address)
            if (!name.endsWith('.eth')) return
            return name
        } catch {
            return
        }
    }
}
