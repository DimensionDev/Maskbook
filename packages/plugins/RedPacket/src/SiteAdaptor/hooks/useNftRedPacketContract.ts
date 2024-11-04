import type { AbiItem } from 'web3-utils'
import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json' with { type: 'json' }
import { type ChainId, useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useContract } from '@masknet/web3-hooks-evm'

export function useNftRedPacketContract(chainId?: ChainId) {
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)
    return useContract<NftRedPacket>(chainId, RED_PACKET_NFT_ADDRESS, NftRedPacketABI as AbiItem[])
}
