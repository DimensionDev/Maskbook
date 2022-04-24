import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState, ProviderStorage, Web3Plugin } from '@masknet/plugin-infra/web3'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    ChainId,
    EIP1193Provider,
    getNetworkTypeFromChainId,
    isSameAddress,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
} from '@masknet/web3-shared-evm'
import { Providers } from './Protocol/provider'

export class Provider
    extends ProviderState<ChainId, ProviderType, NetworkType, EIP1193Provider, Web3>
    implements Web3Plugin.ObjectCapabilities.ProviderState<ChainId, ProviderType, NetworkType>
{
    constructor(context: Plugin.Shared.SharedContext) {
        const defaultValue: ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType> = {
            accounts: getEnumAsArray(ProviderType).reduce((accumulator, providerType) => {
                accumulator[providerType.value] = {
                    account: '',
                    chainId: ChainId.Mainnet,
                }
                return accumulator
            }, {} as Record<ProviderType, Web3Plugin.Account<ChainId>>),
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
                (accumulator, site) => {
                    accumulator[site.value] = ProviderType.MaskWallet
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, Providers, defaultValue, {
            isSameAddress,
            isValidAddress,
            getDefaultChainId: () => ChainId.Mainnet,
            getNetworkTypeFromChainId: (chainId: ChainId) => getNetworkTypeFromChainId(chainId) ?? NetworkType.Ethereum,
        })
    }
}
