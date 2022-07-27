import ENS from 'ethjs-ens'
import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Providers } from './Connection/provider'

export class NameService extends NameServiceState<ChainId> {
    private ens: ENS | null = null

    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidName: (x) => x !== '0x',
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(ChainId.Mainnet, x),
                formatAddress: formatEthereumAddress,
            },
        )
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

    override async lookup(chainId: ChainId, name: string) {
        if (chainId !== ChainId.Mainnet) return

        const cachedAddress = await super.lookup(chainId, name)
        if (cachedAddress) return cachedAddress

        const ens = await this.createENS()
        await super.addAddress(chainId, name, await ens.lookup(name))
        return super.lookup(chainId, name)
    }

    override async reverse(chainId: ChainId, address: string) {
        try {
            if (chainId !== ChainId.Mainnet) return

            const cachedDomain = await super.reverse(chainId, address)
            if (cachedDomain) return cachedDomain

            const ens = await this.createENS()
            const name = await ens.reverse(address)
            await super.addName(chainId, address, name)
            return super.reverse(chainId, address)
        } catch {
            return
        }
    }
}
