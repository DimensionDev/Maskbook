import { createContext, useContext } from 'react'

const PluginWrapperContext = createContext<React.ComponentType<React.PropsWithChildren<{}>>>(DefaultWrapper)
function DefaultWrapper(props: React.PropsWithChildren<{}>) {
    return <>{props.children}</>
}

export function usePluginWrapper() {
    return useContext(PluginWrapperContext)
}

/** @internal */
export const PluginWrapperProvider = PluginWrapperContext.Provider
