import type { RedPacketJSONPayload } from '../types'

export function useRedPacket(rpid: string) {
    const redPackets: RedPacketJSONPayload[] = []
    return redPackets[0]
}

export function useRedpackets() {
    const redPackets: RedPacketJSONPayload[] = []
    return redPackets
}
