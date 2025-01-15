import { NetworkPluginID } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { produce } from 'immer'
import { useMemo } from 'react'
import { SolanaRedPacketCard, type SolanaRedPacketCardProps } from './SolanaRedPacketCard.js'

export function SolanaRedPacketFrame({ payload }: SolanaRedPacketCardProps) {
    const patchedPayload = useMemo(() => {
        return produce(payload, (draft) => {
            if (draft.token) {
                draft.token.runtime = NetworkPluginID.PLUGIN_SOLANA
            }
            if (!draft.accountId) {
                draft.accountId = draft.rpid.replace(/^solana-/, '')
            }
            draft.network = 'devnet'
        })
    }, [payload])
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <SolanaRedPacketCard payload={patchedPayload} />
        </ThemeProvider>
    )
}
