import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNft } from './RedPacketNft'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    return <RedPacketNft payload={payload} />
}
