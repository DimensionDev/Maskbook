import ENS from 'ethjs-ens'
import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceResolver, NameServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Providers } from './Connection/provider'

class ENS_Resolver implements NameServiceResolver<ChainId> {
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

        try {
            const ens = await this.createENS()
            return ens.lookup(name)
        } catch {
            return
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

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            new ENS_Resolver(),
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidName: (x) => x !== '0x',
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress: formatEthereumAddress,
            },
        )
    }
}
