import { createContext, useContext } from 'react'
import { Web3Context } from './unstated-context'
import type { Web3ProviderType } from './type'

const Web3ProviderContext = createContext<Web3ProviderType>(null!)

/** @internal */
export function useWeb3Provider() {
    const context = useContext(Web3ProviderContext)
    if (!context) throw new Error('This hook should be used in a provider.')
    return context
}

// Web3ProviderContext is used to provide a set of API to interact with Web3.
// Web3Context is used to provide a scoped shared state within this provider.
export function Web3Provider(props: React.ProviderProps<Web3ProviderType>) {
    return (
        <Web3ProviderContext.Provider value={props.value}>
            <Web3Context.Provider>{props.children}</Web3Context.Provider>
        </Web3ProviderContext.Provider>
    )
}
