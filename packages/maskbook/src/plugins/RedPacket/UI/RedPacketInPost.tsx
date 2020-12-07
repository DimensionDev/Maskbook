import { useEffect } from 'react'
import type { RedPacketJSONPayload } from '../types'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { getPostUrl } from '../../../social-network/utils/getPostUrl'
import { RedPacket } from './RedPacket'
import { RedPacketRPC } from '../messages'

export interface RedPacketInPostProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { payload } = props

    //#region discover red packet
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const fromUrl = postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined
    useEffect(() => {
        if (!fromUrl) return
        RedPacketRPC.discoverRedPacket(fromUrl, payload)
    }, [fromUrl])
    //#endregion

    return <RedPacket payload={payload} />
}
