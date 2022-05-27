import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState, ProviderStorage } from '@masknet/plugin-infra/web3'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
    chainResolver,
    providerResolver,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../settings'
import { Providers } from './Connection/provider'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(context: Plugin.Shared.SharedContext) {
        const defaultValue: ProviderStorage<Account<ChainId>, ProviderType> = {
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
                accumulator[site.value] = ProviderType.MaskWallet
                return accumulator
            }, {}),
        }

        super(context, Providers, defaultValue, {
            isSameAddress,
            isValidAddress,
            isValidChainId,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultNetworkType: () => NetworkType.Ethereum,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Ethereum,
        })
    }

    override async connect(chainId: ChainId, providerType: ProviderType): Promise<Account<ChainId>> {
        const account = await super.connect(chainId, providerType)

        // add wallet into db
        await SharedContextSettings.value.updateWallet(account.account, {
            name: providerResolver.providerName(providerType)!,
        })

        return account
    }
}
