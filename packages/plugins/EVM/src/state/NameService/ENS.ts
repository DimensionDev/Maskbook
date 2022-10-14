import ENS from 'ethjs-ens'
import namehash from '@ensdomains/eth-ens-namehash'
import { ChainId, ProviderType, isZeroAddress, isEmptyHex } from '@masknet/web3-shared-evm'
import type { NameServiceResolver } from '@masknet/web3-state'
import { Web3StateSettings } from '../../settings/index.js'
import { Providers } from '../Connection/provider.js'
import { attemptUntil } from '@masknet/web3-shared-base'
import { ChainbaseDomain } from '@masknet/web3-providers'

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
        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId,
        })

        try {
            const ens = await this.createENS()
            const lookupAddress = await attemptUntil(
                [() => ens.resolveAddressForNode(namehash.hash(name)), () => ChainbaseDomain.lookup(name, chainId)],
                undefined,
            )
            return isZeroAddress(lookupAddress) || isEmptyHex(lookupAddress)
                ? web3?.eth.ens.registry.getOwner(name)
                : lookupAddress
        } catch {
            return web3?.eth.ens.registry.getOwner(name)
        }
    }

    async reverse(chainId: ChainId, address: string) {
        try {
            const ens = await this.createENS()
            const name = await attemptUntil(
                [() => ens.reverse(address), () => ChainbaseDomain.reverse(address, chainId)],
                undefined,
            )
            if (!name?.endsWith('.eth')) return
            return name
        } catch {
            return
        }
    }
}
