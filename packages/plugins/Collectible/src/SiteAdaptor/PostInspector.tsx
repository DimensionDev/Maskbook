import { MaskLightTheme } from '@masknet/theme'
import { Web3ContextProvider, useNetworkContext } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { ThemeProvider } from '@mui/material'
import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Context/index.js'
import { useNFTXAssetAddress } from './hooks/getNFTXAssetAddress.js'

interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload
    const { pluginID } = useNetworkContext()
    const { data: assetAddress } = useNFTXAssetAddress(token.address, token.provider === SourceType.NFTX)

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <Context
                initialState={{
                    parentPluginID: pluginID,
                    pluginID: token.pluginID,
                    chainId: token.chainId,
                    tokenId: token.tokenId,
                    tokenAddress: assetAddress || token.address,
                }}>
                <Web3ContextProvider network={token.pluginID} chainId={token.chainId}>
                    <Collectible />
                </Web3ContextProvider>
            </Context>
        </ThemeProvider>
    )
}
