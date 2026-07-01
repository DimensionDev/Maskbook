import { HappyRedPacketV1Abi } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import { HappyRedPacketV2Abi } from '@masknet/web3-contracts/types/HappyRedPacketV2.js'
import { HappyRedPacketV3Abi } from '@masknet/web3-contracts/types/HappyRedPacketV3.js'
import { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import {
    type ChainId,
    type ContractWithAddress,
    createContractWithAddress,
    getRedPacketConstants,
    useRedPacketConstants,
} from '@masknet/web3-shared-evm'
import { useMemo } from 'react'

export const RED_PACKET_LATEST_VERSION = 4
export { HappyRedPacketV4Abi as RED_PACKET_LATEST_ABI } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

export function getRedPacketLatestContractAddress(chainId: ChainId) {
    return getRedPacketConstants(chainId).HAPPY_RED_PACKET_ADDRESS_V4
}

export function getRedPacketLatestContractWithAddress(chainId: ChainId) {
    return createContractWithAddress(getRedPacketConstants(chainId).HAPPY_RED_PACKET_ADDRESS_V4, HappyRedPacketV4Abi)
}

export type RedPacketContractAnyVersion =
    | HappyRedPacketV1Abi
    | HappyRedPacketV2Abi
    | HappyRedPacketV3Abi
    | HappyRedPacketV4Abi

export function useRedPacketContract(
    chainId: ChainId,
    version: number,
): ContractWithAddress<RedPacketContractAnyVersion> {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1: addressV1,
        HAPPY_RED_PACKET_ADDRESS_V2: addressV2,
        HAPPY_RED_PACKET_ADDRESS_V3: addressV3,
        HAPPY_RED_PACKET_ADDRESS_V4: addressV4,
    } = useRedPacketConstants(chainId)
    const v1 = useMemo(
        () => createContractWithAddress(addressV1, HappyRedPacketV1Abi),
        [addressV1, HappyRedPacketV1Abi],
    )
    const v2 = useMemo(
        () => createContractWithAddress(addressV2, HappyRedPacketV2Abi),
        [addressV2, HappyRedPacketV2Abi],
    )
    const v3 = useMemo(
        () => createContractWithAddress(addressV3, HappyRedPacketV3Abi),
        [addressV3, HappyRedPacketV3Abi],
    )
    const v4 = useMemo(
        () => createContractWithAddress(addressV4, HappyRedPacketV4Abi),
        [addressV4, HappyRedPacketV4Abi],
    )
    const versions = [v1, v2, v3, v4] as const
    return versions[version - 1] as ContractWithAddress<RedPacketContractAnyVersion>
}
