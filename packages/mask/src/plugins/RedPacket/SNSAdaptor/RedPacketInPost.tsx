import { useEffect } from 'react'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { RedPacket } from './RedPacket'
import { RedPacketRPC } from '../messages'
import { activatedSocialNetworkUI } from '../../../social-network'

export interface RedPacketInPostProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { payload } = props

    // #region discover red packet
    const postIdentifier = usePostInfoDetails.identifier()
    const fromUrl = postIdentifier ? activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier)?.toString() : undefined
    useEffect(() => {
        if (!fromUrl) return
        if (!payload.txid && payload.contract_version !== 1) return
        const record: RedPacketRecord = {
            id: payload.contract_version === 1 ? payload.rpid : payload.txid!,
            from: fromUrl,
            password: payload.password,
            contract_version: payload.contract_version,
        }
        RedPacketRPC.discoverRedPacket(record)
    }, [fromUrl])
    // #endregion

    return <RedPacket payload={payload} />
}
