import { PersistentStorages, type NetworkPluginID } from '@masknet/shared-base'

export function networkStorage(plugin: NetworkPluginID) {
    const { storage: network } = PersistentStorages.Web3.createSubScope(`${plugin}_Network`, {
        networkID: '1_ETH',
        networks: {},
    })
    return Promise.all([network.networkID.initializedPromise, network.networks.initializedPromise]).then(() => network)
}
