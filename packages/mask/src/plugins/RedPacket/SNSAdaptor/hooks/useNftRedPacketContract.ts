import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { ChainId, useContract, useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import type { AbiItem } from 'web3-utils'

export function useNftRedPacketContract(chainId?: ChainId) {
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)
    const contract = useContract<NftRedPacket>(RED_PACKET_NFT_ADDRESS, NftRedPacketABI as AbiItem[], chainId)
    return contract
}
