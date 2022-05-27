import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState, ProviderStorage } from '@masknet/plugin-infra/web3'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import {
    chainResolver,
    ChainId,
    isValidAddress,
    isValidChainId,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
} from '@masknet/web3-shared-flow'
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
                    ProviderType.Blocto,
                ]),
            ) as Record<EnhanceableSite | ExtensionSite, ProviderType>,
        }

        super(context, Providers, defaultValue, {
            isSameAddress,
            isValidChainId,
            isValidAddress,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultNetworkType: () => NetworkType.Flow,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Flow,
        })
    }
}
