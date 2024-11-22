import { PersistentStorages, NetworkPluginID, InMemoryStorages, getSiteType } from '@masknet/shared-base'

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

export function providerStorage<ChainId extends number, ProviderType extends string>(
    pluginID: NetworkPluginID,
    defaultChainId: ChainId,
    defaultProviderType: ProviderType,
) {
    const { storage } = InMemoryStorages.Web3.createSubScope(pluginID, {}).createSubScope(getSiteType() ?? 'Provider', {
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
