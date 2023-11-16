import { usePostLink } from '@masknet/plugin-infra/content-script'
import type { NetworkPluginID } from '@masknet/shared-base'
import { MaskLightTheme } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { RedPacketRecord } from '@masknet/web3-providers/types'
import { ThemeProvider } from '@mui/material'
import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import { RedPacket, type RedPacketProps } from './RedPacket/index.js'

export function RedPacketInPost({ payload }: RedPacketProps) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const fromUrl = usePostLink()

    useEffect(() => {
        if (!fromUrl) return
        if (!payload.txid && payload.contract_version !== 1) return
        const record: RedPacketRecord = {
            id: payload.contract_version === 1 ? payload.rpid : payload.txid,
            from: fromUrl.toString(),
            password: payload.password,
            contract_version: payload.contract_version,
        }
        RedPacketRPC.addRedPacket(record, chainId)
    }, [fromUrl, chainId])
    // #endregion

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <RedPacket payload={payload} />
        </ThemeProvider>
    )
}
