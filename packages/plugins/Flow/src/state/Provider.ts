import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/plugin-infra/web3'
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
        const defaultValue = {
            // TODO: 6002
            // eslint-disable-next-line unicorn/no-array-reduce
            accounts: getEnumAsArray(ProviderType).reduce<Record<ProviderType, Account<ChainId>>>(
                (accumulator, providerType) => {
                    accumulator[providerType.value] = {
                        account: '',
                        chainId: ChainId.Mainnet,
                    }
                    return accumulator
                },
                {},
            ),
            // TODO: 6002
            // eslint-disable-next-line unicorn/no-array-reduce
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce<
                Record<EnhanceableSite | ExtensionSite, ProviderType>
            >((accumulator, site) => {
                accumulator[site.value] = ProviderType.Blocto
                return accumulator
            }, {}),
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
