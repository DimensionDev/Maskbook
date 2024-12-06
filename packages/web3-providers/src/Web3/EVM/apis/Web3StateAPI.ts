import { getEnumAsArray } from '@masknet/kit'
import { lazyObject, PersistentStorages, NetworkPluginID, InMemoryStorages, NameServiceID } from '@masknet/shared-base'
import { type Web3State, getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-evm'
import * as RiskWarning from /* webpackDefer: true */ '../state/RiskWarning.js'
import * as NameService from /* webpackDefer: true */ '../state/NameService.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'

import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as BalanceNotifier from /* webpackDefer: true */ '../state/BalanceNotifier.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { networkStorage, providerStorage } from '../../Base/storage.js'

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: nameService } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_NameServiceV2`, {
        value: Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as Record<
            NameServiceID,
            Record<string, string>
        >,
    }).storage
    const { value: riskWarning } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_RiskWarning`, {
        value: {},
    }).storage
    const { messages } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Message`, {
        messages: {},
    }).storage

    const [network, provider] = await Promise.all([
        networkStorage(NetworkPluginID.PLUGIN_EVM),
        providerStorage(NetworkPluginID.PLUGIN_EVM, getDefaultChainId(), getDefaultProviderType()),
        nameService.initializedPromise,
        messages.initializedPromise,
    ] as const)

    const state: Web3State = lazyObject({
        Provider: () => new Provider.EVMProvider(context, provider),
        BalanceNotifier: () => new BalanceNotifier.EVMBalanceNotifier(),
        Network: () => new Network.EVMNetwork(NetworkPluginID.PLUGIN_EVM, network.networkID, network.networks),
        IdentityService: () => new IdentityService.EVMIdentityService(),
        NameService: () => new NameService.EVMNameService(nameService),
        RiskWarning: () => new RiskWarning.EVMRiskWarning(state.Provider?.account, riskWarning),
    })
    return state
}
