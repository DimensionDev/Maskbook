import { useEffect } from 'react'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
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
    const fromUrl =
        postIdentifier && !postIdentifier.isUnknown
            ? activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier)?.toString()
            : undefined
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
