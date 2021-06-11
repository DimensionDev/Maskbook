import type { AbiItem } from 'web3-utils'
import { RED_PACKET_CONSTANTS } from '../constants'
import { useConstant, useContract } from '@dimensiondev/web3-shared'
import HappyRedPacketV1ABI from '@dimensiondev/contracts/abis/HappyRedPacketV1.json'
import type { HappyRedPacketV1 } from '@dimensiondev/contracts/types/HappyRedPacketV1'
import HappyRedPacketV2ABI from '@dimensiondev/contracts/abis/HappyRedPacketV2.json'
import type { HappyRedPacketV2 } from '@dimensiondev/contracts/types/HappyRedPacketV2'
import HappyRedPacketV3ABI from '@dimensiondev/contracts/abis/HappyRedPacketV3.json'
import type { HappyRedPacketV3 } from '@dimensiondev/contracts/types/HappyRedPacketV3'

export function useRedPacketContract(version: number) {
    const addressV1 = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS_V1')
    const v1 = useContract<HappyRedPacketV1>(addressV1, HappyRedPacketV1ABI as AbiItem[])
    const addressV2 = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS_V2')
    const v2 = useContract<HappyRedPacketV2>(addressV2, HappyRedPacketV2ABI as AbiItem[])

    const addressV3 = useConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS_V3')
    const v3 = useContract<HappyRedPacketV3>(addressV3, HappyRedPacketV3ABI as AbiItem[])
    const versions = [v1, v2, v3]
    return versions[version - 1]
}
