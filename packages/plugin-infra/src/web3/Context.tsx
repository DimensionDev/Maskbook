import React, { createContext, useContext } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'

const PluginIDContext = createContext(NetworkPluginID.PLUGIN_EVM)

const PluginsWeb3Context = createContext<Record<string, Web3Helper.Web3State<NetworkPluginID>>>(null!)

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const pluginID = useContext(PluginIDContext)
    return expectedPluginID ?? pluginID
}

export function PluginsWeb3ContextProvider<T extends NetworkPluginID>({
    pluginID,
    value,
    children,
}: { pluginID: T } & React.ProviderProps<Record<string, Web3Helper.Web3State<T>>>) {
    return (
        <PluginIDContext.Provider value={pluginID}>
            <PluginsWeb3Context.Provider value={value}>{children}</PluginsWeb3Context.Provider>
        </PluginIDContext.Provider>
    )
}
