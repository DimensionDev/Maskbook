import { NetworkContextProvider, usePluginContext, ChainContextProvider } from '@masknet/web3-hooks-base'
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
    const { pluginID } = usePluginContext()

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
                <NetworkContextProvider value={token.pluginID}>
                    <ChainContextProvider
                        value={{
                            chainId: token.chainId,
                        }}>
                        <Collectible />
                    </ChainContextProvider>
                </NetworkContextProvider>
            </Context.Provider>
        </ThemeProvider>
    )
}
