import { useEffect } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { usePostLink } from '@masknet/plugin-infra/content-script'
import { RedPacket } from './RedPacket/index.js'
import { RedPacketRPC } from '../messages.js'
import type { RedPacketJSONPayload, RedPacketRecord } from '@masknet/web3-providers/types'

export interface RedPacketInPostProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { payload } = props
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

    return <RedPacket payload={payload} />
}
