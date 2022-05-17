import type { AbiItem } from 'web3-utils'
import { useContract, useArtBlocksConstants, useChainId } from '@masknet/web3-shared-evm'
import ArtBlocksCoreContractABI from '@masknet/web3-contracts/abis/ArtBlocksMinterContract.json'

import type { ArtBlocksMinterContract } from '@masknet/web3-contracts/types/ArtBlocksMinterContract'

export function useArtBlocksContract() {
    const chainId = useChainId()
    const { GEN_ART_721_MINTER } = useArtBlocksConstants()
    const genArt721MinterContract = useContract<ArtBlocksMinterContract>(
        chainId,
        GEN_ART_721_MINTER,
        ArtBlocksCoreContractABI as AbiItem[],
    )
    return genArt721MinterContract
}
