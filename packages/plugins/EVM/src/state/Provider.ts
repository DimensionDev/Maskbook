import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { ProviderState, Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite, ExtensionSite, getSiteType } from '@masknet/shared-base'
import { ChainId, getNetworkTypeFromChainId, isSameAddress, NetworkType, ProviderType } from '@masknet/web3-shared-evm'

interface Account {
    account: string
    chainId: ChainId
}

export class Provider
    extends ProviderState<ChainId, NetworkType, ProviderType, Account>
    implements Web3Plugin.ObjectCapabilities.ProviderState<ChainId, NetworkType, ProviderType, Account>
{
    constructor(context: Plugin.Shared.SharedContext) {
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
                    accumulator[site.value] = ProviderType.MaskWallet
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, defaultValue, {
            isSameAddress,
            getNetworkTypeFromChainId: (chainId: ChainId) => getNetworkTypeFromChainId(chainId) ?? NetworkType.Ethereum,
        })
    }

    async connect(chainId: ChainId, providerType: ProviderType) {
        const site = getSiteType()

        switch (providerType) {
            case ProviderType.MaskWallet:
                break
            default:
                unreachable(providerType)
        }
    }

    async discconect(providerType: ProviderType) {}
}
