import { useContract } from '@masknet/web3-hooks-evm'
import { type ChainId, useArtBlocksConstants } from '@masknet/web3-shared-evm'

import {
    ArtBlocksMinterContractAbi,
    type ArtBlocksMinterContract,
} from '@masknet/web3-contracts/types/ArtBlocksMinterContract.js'

export function useArtBlocksContract(chainId: ChainId) {
    const { GEN_ART_721_MINTER } = useArtBlocksConstants(chainId)
    return useContract<ArtBlocksMinterContract>(chainId, GEN_ART_721_MINTER, ArtBlocksMinterContractAbi)
}
