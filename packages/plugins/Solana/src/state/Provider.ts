import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ProviderState, ProviderStorage } from '@masknet/plugin-infra/web3'
import {
    isValidChainId,
    isValidAddress,
    chainResolver,
    ChainId,
    NetworkType,
    ProviderType,
    Web3Provider,
    Web3,
} from '@masknet/web3-shared-solana'
import { Providers } from './Connection/provider'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue: ProviderStorage<Account<ChainId>, ProviderType> = {
            accounts: Object.fromEntries(
                getEnumAsArray(ProviderType).map((x) => [
                    x.value,
                    {
                        account: '',
                        chainId: ChainId.Mainnet,
                    },
                ]),
            ) as Record<ProviderType, Account<ChainId>>,
            providers: Object.fromEntries(
                [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].map((x) => [
                    x.value,
                    ProviderType.Phantom,
                ]),
            ) as Record<EnhanceableSite | ExtensionSite, ProviderType>,
        }

        super(context, Providers, defaultValue, {
            isSameAddress,
            isValidChainId,
            isValidAddress,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultNetworkType: () => NetworkType.Solana,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Solana,
        })
    }
}
