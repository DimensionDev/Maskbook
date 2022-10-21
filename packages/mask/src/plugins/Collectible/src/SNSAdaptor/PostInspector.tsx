import { PluginIDContextProvider, usePluginIDContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
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
    const { pluginID } = usePluginIDContext()

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <Context.Provider
                initialState={{
                    parentPluginID: pluginID,
                    pluginID: token.pluginID,
                    chainId: token.chainId,
                    tokenId: token.tokenId,
                    tokenAddress: token.address,
                }}>
                <PluginIDContextProvider value={token.pluginID}>
                    <Web3ContextProvider
                        value={{
                            chainId: token.chainId,
                        }}>
                        <Collectible />
                    </Web3ContextProvider>
                </PluginIDContextProvider>
            </Context.Provider>
        </ThemeProvider>
    )
}
