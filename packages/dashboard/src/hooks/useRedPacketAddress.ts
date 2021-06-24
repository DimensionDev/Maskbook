import { useRedPacketConstants } from '@masknet/constants'

export function useRedPacketAddress() {
    const { HAPPY_RED_PACKET_ADDRESS_V2, HAPPY_RED_PACKET_ADDRESS_V3 } = useRedPacketConstants()

    return HAPPY_RED_PACKET_ADDRESS_V2 ?? HAPPY_RED_PACKET_ADDRESS_V3
}
