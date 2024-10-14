import { useContract } from '@masknet/web3-hooks-evm'
import HappyRedPacketV1ABI from '@masknet/web3-contracts/abis/HappyRedPacketV1.json' with { type: 'json' }
import HappyRedPacketV2ABI from '@masknet/web3-contracts/abis/HappyRedPacketV2.json' with { type: 'json' }
import HappyRedPacketV3ABI from '@masknet/web3-contracts/abis/HappyRedPacketV3.json' with { type: 'json' }
import HappyRedPacketV4ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json' with { type: 'json' }
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import type { HappyRedPacketV2 } from '@masknet/web3-contracts/types/HappyRedPacketV2.js'
import type { HappyRedPacketV3 } from '@masknet/web3-contracts/types/HappyRedPacketV3.js'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { type ChainId, useRedPacketConstants } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useRedPacketContract(chainId: ChainId, version: number) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1: addressV1,
        HAPPY_RED_PACKET_ADDRESS_V2: addressV2,
        HAPPY_RED_PACKET_ADDRESS_V3: addressV3,
        HAPPY_RED_PACKET_ADDRESS_V4: addressV4,
    } = useRedPacketConstants(chainId)
    const v1 = useContract<HappyRedPacketV1>(chainId, addressV1, HappyRedPacketV1ABI as AbiItem[])
    const v2 = useContract<HappyRedPacketV2>(chainId, addressV2, HappyRedPacketV2ABI as AbiItem[])
    const v3 = useContract<HappyRedPacketV3>(chainId, addressV3, HappyRedPacketV3ABI as AbiItem[])
    const v4 = useContract<HappyRedPacketV4>(chainId, addressV4, HappyRedPacketV4ABI as AbiItem[])
    const versions = [v1, v2, v3, v4] as const
    return versions[version - 1]
}
