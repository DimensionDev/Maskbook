import type { AbiItem } from 'web3-utils'
import { RED_PACKET_CONSTANTS } from '../constants'
import HappyRedPacketABI from '@dimensiondev/contracts/abis/HappyRedPacket.json'
import type { HappyRedPacket } from '@dimensiondev/contracts/types/HappyRedPacket'
import { useConstant, useContract } from '@dimensiondev/web3-shared'

export function useRedPacketContract() {
    const redPacketContractAddress = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS')
    return useContract<HappyRedPacket>(redPacketContractAddress, HappyRedPacketABI as AbiItem[])
}
