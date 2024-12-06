import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID, InMemoryStorages, NameServiceID } from '@masknet/shared-base'
import { type Web3State } from '@masknet/web3-shared-evm'
import * as NameService from /* webpackDefer: true */ '../state/NameService.js'

import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as BalanceNotifier from /* webpackDefer: true */ '../state/BalanceNotifier.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { networkStorage } from '../../Base/storage.js'

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: nameService } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_NameServiceV2`, {
        value: Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as Record<
            NameServiceID,
            Record<string, string>
        >,
    }).storage

    const [network] = await Promise.all([
        networkStorage(NetworkPluginID.PLUGIN_EVM),
        nameService.initializedPromise,
    ] as const)

    const state: Web3State = {
        Wallet: context.EVM,
        BalanceNotifier: new BalanceNotifier.EVMBalanceNotifier(),
        Network: new Network.EVMNetwork(NetworkPluginID.PLUGIN_EVM, network.networkID, network.networks),
        IdentityService: new IdentityService.EVMIdentityService(),
        NameService: new NameService.EVMNameService(nameService),
    }
    return state
}
