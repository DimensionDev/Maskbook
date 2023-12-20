import {
    PersistentStorages,
    type NetworkPluginID,
    EMPTY_LIST,
    InMemoryStorages,
    getSiteType,
} from '@masknet/shared-base'
import { CurrencyType, GasOptionType, SourceType, type Contact } from '@masknet/web3-shared-base'

export function addressStorage(plugin: NetworkPluginID) {
    const { value: address } = PersistentStorages.Web3.createSubScope(`${plugin}_AddressBookV2`, {
        value: EMPTY_LIST as Contact[],
    }).storage
    return address.initializedPromise.then(() => address)
}

export function networkStorage(plugin: NetworkPluginID) {
    const { storage: network } = PersistentStorages.Web3.createSubScope(`${plugin}_Network`, {
        networkID: '1_ETH',
        networks: {},
    })
    return Promise.all([network.networkID.initializedPromise, network.networks.initializedPromise]).then(() => network)
}

export function tokenStorage(plugin: NetworkPluginID) {
    const { storage: token } = PersistentStorages.Web3.createSubScope(`${plugin}_Token`, {
        fungibleTokenList: {},
        credibleFungibleTokenList: {},
        nonFungibleTokenList: {},
        credibleNonFungibleTokenList: {},
        fungibleTokenBlockedBy: {},
        nonFungibleTokenBlockedBy: {},
        nonFungibleCollectionMap: {},
    })
    return Promise.all([
        token.fungibleTokenList.initializedPromise,
        token.credibleFungibleTokenList.initializedPromise,
        token.nonFungibleTokenList.initializedPromise,
        token.credibleNonFungibleTokenList.initializedPromise,
        token.fungibleTokenBlockedBy.initializedPromise,
        token.nonFungibleTokenBlockedBy.initializedPromise,
        token.nonFungibleCollectionMap.initializedPromise,
    ]).then(() => token)
}

export function settingsStorage(plugin: NetworkPluginID) {
    const { storage: settings } = PersistentStorages.Web3.createSubScope(`${plugin}_Settings`, {
        currencyType: CurrencyType.USD,
        gasOptionType: GasOptionType.NORMAL,
        fungibleAssetSourceType: SourceType.DeBank,
        nonFungibleAssetSourceType: SourceType.OpenSea,
    })
    return Promise.all([
        settings.currencyType.initializedPromise,
        settings.fungibleAssetSourceType.initializedPromise,
        settings.gasOptionType.initializedPromise,
        settings.nonFungibleAssetSourceType.initializedPromise,
    ]).then(() => settings)
}
export function providerStorage<ChainId extends number, ProviderType extends string>(
    pluginID: NetworkPluginID,
    defaultChainId: ChainId,
    defaultProviderType: ProviderType,
) {
    const { storage } = InMemoryStorages.Web3.createSubScope(`${pluginID}_${getSiteType() ?? 'Provider'}`, {
        account: {
            account: '',
            chainId: defaultChainId,
        },
        providerType: defaultProviderType,
    })
    return Promise.all([storage.account.initializedPromise, storage.providerType.initializedPromise]).then(
        () => storage,
    )
}
