import { lazyObject, PersistentStorages, NetworkPluginID, EMPTY_LIST, InMemoryStorages } from '@masknet/shared-base'
import {
    type ChainId,
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    getDefaultChainId,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import * as AddressBook from /* webpackDefer: true */ '../state/AddressBook.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Settings from /* webpackDefer: true */ '../state/Settings.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'
import { CurrencyType, GasOptionType, SourceType } from '@masknet/web3-shared-base'
import { ProviderState } from '../../Base/state/Provider.js'

export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: address } = PersistentStorages.Web3.createSubScope(
        `${NetworkPluginID.PLUGIN_SOLANA}_AddressBookV2`,
        { value: EMPTY_LIST },
    ).storage
    const { storage: network } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_SOLANA}_Network`, {
        networkID: '1_ETH',
        networks: {},
    })
    const { value: transaction } = PersistentStorages.Web3.createSubScope(
        `${NetworkPluginID.PLUGIN_SOLANA}_Transaction`,
        { value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType> },
    ).storage
    const { storage: settings } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_SOLANA}_Settings`, {
        currencyType: CurrencyType.USD,
        gasOptionType: GasOptionType.NORMAL,
        fungibleAssetSourceType: SourceType.DeBank,
        nonFungibleAssetSourceType: SourceType.OpenSea,
    })
    const providerStorage = ProviderState.createStorage(
        NetworkPluginID.PLUGIN_FLOW,
        getDefaultChainId(),
        getDefaultProviderType(),
    )
    await Promise.all([
        providerStorage.account.initializedPromise,
        providerStorage.providerType.initializedPromise,
        address.initializedPromise,
        network.networkID.initializedPromise,
        network.networks.initializedPromise,
        transaction.initializedPromise,
        settings.currencyType.initializedPromise,
        settings.fungibleAssetSourceType.initializedPromise,
        settings.gasOptionType.initializedPromise,
        settings.nonFungibleAssetSourceType.initializedPromise,
    ] as const)

    const state: Web3State = lazyObject({
        Provider: () => new Provider.SolanaProvider(context, providerStorage),
        AddressBook: () => new AddressBook.SolanaAddressBook(address),
        IdentityService: () => new IdentityService.SolanaIdentityService(),
        Settings: () => new Settings.SolanaSettings(settings),
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
