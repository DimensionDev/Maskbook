import { lazyObject, NetworkPluginID } from '@masknet/shared-base'
import { type Web3State, getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-solana'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { networkStorage, providerStorage } from '../../Base/storage.js'

export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
    const [network, provider] = await Promise.all([
        networkStorage(NetworkPluginID.PLUGIN_SOLANA),
        providerStorage(NetworkPluginID.PLUGIN_SOLANA, getDefaultChainId(), getDefaultProviderType()),
    ])

    const state: Web3State = lazyObject({
        Provider: () => new Provider.SolanaProvider(context.signWithPersona, provider),
        IdentityService: () => new IdentityService.SolanaIdentityService(),
        Network: () => new Network.SolanaNetwork(NetworkPluginID.PLUGIN_SOLANA, network.networkID, network.networks),
    })
    return state
}
