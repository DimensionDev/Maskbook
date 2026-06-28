import { useContract } from '@masknet/web3-hooks-evm'
import { HappyRedPacketV1Abi } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import { HappyRedPacketV2Abi } from '@masknet/web3-contracts/types/HappyRedPacketV2.js'
import { HappyRedPacketV3Abi } from '@masknet/web3-contracts/types/HappyRedPacketV3.js'
import { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { type ChainId, type ContractWithAddress, useRedPacketConstants } from '@masknet/web3-shared-evm'
import type { HappyRedPacketV4Abi as HappyRedPacketV4AbiType } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

export function useRedPacketContract(chainId: ChainId, version: number) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1: addressV1,
        HAPPY_RED_PACKET_ADDRESS_V2: addressV2,
        HAPPY_RED_PACKET_ADDRESS_V3: addressV3,
        HAPPY_RED_PACKET_ADDRESS_V4: addressV4,
    } = useRedPacketConstants(chainId)
    const v1 = useContract(chainId, addressV1, HappyRedPacketV1Abi)
    const v2 = useContract(chainId, addressV2, HappyRedPacketV2Abi)
    const v3 = useContract(chainId, addressV3, HappyRedPacketV3Abi)
    const v4 = useContract(chainId, addressV4, HappyRedPacketV4Abi)
    const versions = [v1, v2, v3, v4] as const
    return versions[version - 1]
}

export function getRedPacketContractAbi(version: number) {
    const versions = [HappyRedPacketV1Abi, HappyRedPacketV2Abi, HappyRedPacketV3Abi, HappyRedPacketV4Abi] as const
    return versions[version - 1]!
}

export function asHappyRedPacketV4Contract(contract: unknown) {
    return contract as ContractWithAddress<HappyRedPacketV4AbiType> | null | undefined
}
