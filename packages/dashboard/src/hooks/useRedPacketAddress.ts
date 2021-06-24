import { useConstant } from '@masknet/web3-shared'
import { RED_PACKET_CONSTANTS } from '../constants'

export function useRedPacketAddress() {
    const { HAPPY_RED_PACKET_ADDRESS_V2, HAPPY_RED_PACKET_ADDRESS_V3 } = useConstant(RED_PACKET_CONSTANTS)

    return HAPPY_RED_PACKET_ADDRESS_V2 ?? HAPPY_RED_PACKET_ADDRESS_V3
}
