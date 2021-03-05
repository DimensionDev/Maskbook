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

    //#region discover red packet
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const fromUrl =
        postIdentifier && !postIdentifier.isUnknown
            ? activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier)?.toString()
            : undefined
    useEffect(() => {
        if (!fromUrl) return
        if (!payload.txid) return
        const record: RedPacketRecord = {
            id: payload.txid,
            from: fromUrl,
            password: payload.password,
        }
        RedPacketRPC.discoverRedPacket(record)
    }, [fromUrl])
    //#endregion

    return <RedPacket payload={payload} />
}
