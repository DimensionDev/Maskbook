import HappyRedPacketABI from '@dimensiondev/contracts/abis/HappyRedPacket.json'
import type { HappyRedPacket } from '@dimensiondev/contracts/types/HappyRedPacket'
import { useConstant } from '../../../web3/hooks/useConstant'
import { RED_PACKET_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'

export function useRedPacketContract() {
    const address = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    return useContract<HappyRedPacket>(address, HappyRedPacketABI)
}
