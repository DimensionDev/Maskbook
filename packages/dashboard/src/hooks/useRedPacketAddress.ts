import { useConstant } from '@masknet/web3-shared'
import { RED_PACKET_CONSTANTS } from '../constants'

export function useRedPacketAddress() {
    const addressV2 = useConstant(RED_PACKET_CONSTANTS).HAPPY_RED_PACKET_ADDRESS_V2
    const addressV3 = useConstant(RED_PACKET_CONSTANTS).HAPPY_RED_PACKET_ADDRESS_V3

    return addressV2 ?? addressV3
}
