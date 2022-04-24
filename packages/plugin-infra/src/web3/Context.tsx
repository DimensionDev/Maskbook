import React, { createContext, useContext } from 'react'
import type { Web3Helper } from '../web3-helpers'
import { NetworkPluginID } from '../web3-types'

const PluginIDContext = createContext(NetworkPluginID.PLUGIN_EVM)

const PluginsWeb3Context = createContext<Record<string, Web3Helper.Web3State>>(null!)

export function useCurrentWeb3NetworkPluginID(expectedPluginID?: NetworkPluginID) {
    const pluginID = useContext(PluginIDContext)
    return expectedPluginID ?? pluginID
}

export function PluginsWeb3ContextProvider({
    pluginID,
    value,
    children,
}: { pluginID: string } & React.ProviderProps<Record<string, Web3Helper.Web3State>>) {
    return (
        <PluginIDContext.Provider value={pluginID as NetworkPluginID}>
            <PluginsWeb3Context.Provider value={value}>{children}</PluginsWeb3Context.Provider>
        </PluginIDContext.Provider>
    )
}
