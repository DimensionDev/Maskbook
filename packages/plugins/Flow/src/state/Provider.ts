import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    ChainId,
    FclProvider,
    isSameAddress,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
} from '@masknet/web3-shared-flow'
import { Providers } from './Protocol/provider'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, FclProvider, Web3> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = {
            accounts: getEnumAsArray(ProviderType).reduce((accumulator, providerType) => {
                accumulator[providerType.value] = {
                    account: '',
                    chainId: ChainId.Mainnet,
                }
                return accumulator
            }, {} as Record<ProviderType, Web3Plugin.Account<ChainId>>),
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
                (accumulator, site) => {
                    accumulator[site.value] = ProviderType.Blocto
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, Providers, defaultValue, {
            isSameAddress,
            isValidAddress,
            getDefaultChainId: () => ChainId.Mainnet,
            getNetworkTypeFromChainId,
        })
    }
}
