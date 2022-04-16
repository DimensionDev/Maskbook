import { getEnumAsArray } from '@dimensiondev/kit'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/plugin-infra/web3'
import { ChainId, getNetworkTypeFromChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'

interface Account {
    account: string
    chainId: ChainId
}

export class Provider extends ProviderState<ChainId, NetworkType, ProviderType, Account> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = {
            accounts: getEnumAsArray(ProviderType).reduce((accumulator, providerType) => {
                accumulator[providerType.value] = {
                    account: '',
                    chainId: ChainId.Mainnet,
                }
                return accumulator
            }, {} as Record<ProviderType, Account>),
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
                (accumulator, site) => {
                    accumulator[site.value] = ProviderType.Phantom
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, defaultValue, {
            getNetworkTypeFromChainId,
        })
    }
}
