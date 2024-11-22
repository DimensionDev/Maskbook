import { lazyObject, PersistentStorages, NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainId,
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    getDefaultChainId,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'
import { networkStorage, providerStorage } from '../../Base/storage.js'
export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: transaction } = PersistentStorages.Web3.createSubScope(
        `${NetworkPluginID.PLUGIN_SOLANA}_Transaction`,
        { value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType> },
    ).storage
    const [network, provider] = await Promise.all([
        networkStorage(NetworkPluginID.PLUGIN_SOLANA),
        providerStorage(NetworkPluginID.PLUGIN_SOLANA, getDefaultChainId(), getDefaultProviderType()),

        transaction.initializedPromise,
    ])

    const state: Web3State = lazyObject({
        Provider: () => new Provider.SolanaProvider(context.signWithPersona, provider),
        IdentityService: () => new IdentityService.SolanaIdentityService(),
        Network: () => new Network.SolanaNetwork(NetworkPluginID.PLUGIN_SOLANA, network.networkID, network.networks),
        Transaction: () =>
            new Transaction.SolanaTransaction(
                {
                    chainId: state.Provider?.chainId,
                    account: state.Provider?.account,
                },
                transaction,
            ),
    })
    return state
}
