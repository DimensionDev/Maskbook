import ENS from 'ethjs-ens'
import namehash from '@ensdomains/eth-ens-namehash'
import { NameServiceID } from '@masknet/shared-base'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId, ProviderType, isZeroAddress, isEmptyHex } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../settings/index.js'
import { Providers } from '../Connection/provider.js'

export class ENS_Resolver implements NameServiceResolver {
    private ens: ENS | null = null

    public get id() {
        return NameServiceID.ENS
    }

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

    async lookup(name: string) {
        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId: ChainId.Mainnet,
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

    async reverse(address: string) {
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
