import type { AbiItem } from 'web3-utils'
import { ChainId, useArtBlocksConstants } from '@masknet/web3-shared-evm'
import ArtBlocksCoreContractABI from '@masknet/web3-contracts/abis/ArtBlocksMinterContract.json'
import type { ArtBlocksMinterContract } from '@masknet/web3-contracts/types/ArtBlocksMinterContract'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useArtBlocksContract(chainId?: ChainId) {
    const { GEN_ART_721_MINTER } = useArtBlocksConstants()
    const art721MinterContract = useContract<ArtBlocksMinterContract>(
        chainId,
        GEN_ART_721_MINTER,
        ArtBlocksCoreContractABI as AbiItem[],
    )
    return art721MinterContract
}
