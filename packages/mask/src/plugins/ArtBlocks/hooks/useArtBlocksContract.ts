import type { AbiItem } from 'web3-utils'
import { useContract, useArtBlocksConstants } from '@masknet/web3-shared-evm'
import ArtBlocksCoreContractABI from '@masknet/web3-contracts/abis/ArtBlocksMinterContract.json'
import type { ArtBlocksMinterContract } from '@masknet/web3-contracts/types/ArtBlocksMinterContract'

export function useArtBlocksContract() {
    const { GEN_ART_721_MINTER } = useArtBlocksConstants()
    const art721MinterContract = useContract<ArtBlocksMinterContract>(
        GEN_ART_721_MINTER,
        ArtBlocksCoreContractABI as AbiItem[],
    )
    return art721MinterContract
}
