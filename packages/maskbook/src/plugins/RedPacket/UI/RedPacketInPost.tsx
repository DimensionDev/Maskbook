import React, { useEffect } from 'react'
import type { RedPacketJSONPayload } from '../types'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { getPostUrl } from '../../../social-network/utils/getPostUrl'
import Services from '../../../extension/service'
import { RedPacket } from './RedPacket'

export interface RedPacketInPostProps {
    from: string
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { from, payload } = props

    //#region discover red packet
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const fromUrl = postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined
    useEffect(() => {
        if (!fromUrl) return
        Services.Plugin.invokePlugin('maskbook.red_packet', 'discoverRedPacket', fromUrl, payload)
    }, [fromUrl])
    //#endregion

    return <RedPacket from={from} payload={payload} />
}
