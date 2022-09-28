import { PluginIDContextProvider, PluginWeb3ContextProvider } from '@masknet/plugin-infra/web3'
import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Context/index.js'

export interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    console.log('DEBUG: token')
    console.log({
        token,
    })

    return (
        <Context.Provider
            initialState={{
                pluginID: token.pluginID,
                chainId: token.chainId,
                tokenId: token.tokenId,
                tokenAddress: token.address,
            }}>
            <PluginIDContextProvider value={token.pluginID}>
                <PluginWeb3ContextProvider
                    pluginID={token.pluginID}
                    value={{
                        chainId: token.chainId,
                    }}>
                    <Collectible />
                </PluginWeb3ContextProvider>
            </PluginIDContextProvider>
        </Context.Provider>
    )
}
