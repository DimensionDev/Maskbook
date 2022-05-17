import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { useChainId, useContract, useNftRedPacketConstants } from '@masknet/web3-shared-evm'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import type { AbiItem } from 'web3-utils'

export function useNftRedPacketContract() {
    const chainId = useChainId()
    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants()
    const contract = useContract<NftRedPacket>(chainId, RED_PACKET_NFT_ADDRESS, NftRedPacketABI as AbiItem[])
    return contract
}
