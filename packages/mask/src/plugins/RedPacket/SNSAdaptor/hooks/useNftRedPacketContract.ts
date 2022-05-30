import type { AbiItem } from 'web3-utils'
import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { ChainId, useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useNftRedPacketContract(chainId?: ChainId) {
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)
    return useContract<NftRedPacket>(chainId, RED_PACKET_NFT_ADDRESS, NftRedPacketABI as AbiItem[])
}
