import {
    PluginIDContextProvider,
    PluginWeb3ContextProvider,
    useCurrentWeb3NetworkPluginID,
} from '@masknet/web3-hooks-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Context/index.js'

export interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload
    const parentPluginID = useCurrentWeb3NetworkPluginID()

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <Context.Provider
                initialState={{
                    parentPluginID,
                    pluginID: token.pluginID,
                    chainId: token.chainId,
                    tokenId: token.tokenId,
                    tokenAddress: token.address,
                }}>
                <PluginIDContextProvider value={token.pluginID}>
                    <PluginWeb3ContextProvider
                        value={{
                            chainId: token.chainId,
                            networkPluginId: token.pluginID,
                        }}>
                        <Collectible />
                    </PluginWeb3ContextProvider>
                </PluginIDContextProvider>
            </Context.Provider>
        </ThemeProvider>
    )
}
