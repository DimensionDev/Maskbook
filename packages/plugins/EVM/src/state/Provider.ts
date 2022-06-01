import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/plugin-infra/web3'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
    chainResolver,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../settings'
import { Providers } from './Connection/provider'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, Providers, {
            isSameAddress,
            isValidAddress,
            isValidChainId,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultNetworkType: () => NetworkType.Ethereum,
            getDefaultProviderType: () => ProviderType.MaskWallet,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Ethereum,
        })
    }

    override async connect(chainId: ChainId, providerType: ProviderType): Promise<Account<ChainId>> {
        const account = await super.connect(chainId, providerType)

        // add wallet into db
        await SharedContextSettings.value.updateWallet(account.account)

        return account
    }
}
