import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { RED_PACKET_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import HappyRedPacketABI from '../../../../abis/HappyRedPacket.json'
import type { HappyRedPacket } from '../../../contracts/HappyRedPacket'

export function useRedPacketContract() {
    const address = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    return useContract<HappyRedPacket>(address, HappyRedPacketABI as AbiItem[])
}
