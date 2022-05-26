import { useEffect } from 'react'
import { RedPacketRPC } from '../messages'
import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNft } from './RedPacketNft'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    useEffect(() => {
        RedPacketRPC.updateRedPacketNft({
            id: payload.txid,
            type: 'red-packet-nft',
            password: payload.privateKey,
            contract_version: payload.contractVersion,
        })
    }, [payload])
    return <RedPacketNft payload={payload} />
}
