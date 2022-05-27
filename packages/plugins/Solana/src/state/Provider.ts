import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ProviderState } from '@masknet/plugin-infra/web3'
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
                accumulator[site.value] = ProviderType.Phantom
                return accumulator
            }, {}),
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
