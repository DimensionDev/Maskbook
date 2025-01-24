import { NetworkPluginID } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { produce } from 'immer'
import { useMemo } from 'react'
import { SolanaRedPacketCard, type SolanaRedPacketCardProps } from './SolanaRedPacketCard.js'
import { SolanaChainResolver } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-solana'
import { SOLWeb3ContextProvider, useNetworkContext } from '@masknet/web3-hooks-base'

export function SolanaRedPacketFrame({ payload }: Omit<SolanaRedPacketCardProps, 'currentPluginID'>) {
    const { pluginID } = useNetworkContext()
    const patchedPayload = useMemo(() => {
        return produce(payload, (draft) => {
            if (draft.token) {
                draft.token.runtime = NetworkPluginID.PLUGIN_SOLANA
            }
            if (payload.rpid.startsWith('solana-')) {
                draft.rpid = payload.rpid.slice(7)
            }
            // compatible to legacy payload
            draft.accountId = draft.rpid
            if ((payload.network as string) === 'mainnet') draft.network = 'mainnet-beta'
        })
    }, [payload])
    const payloadChainId =
        payload.token?.chainId ?? SolanaChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <SOLWeb3ContextProvider chainId={payloadChainId}>
                <SolanaRedPacketCard payload={patchedPayload} currentPluginID={pluginID} />
            </SOLWeb3ContextProvider>
        </ThemeProvider>
    )
}
