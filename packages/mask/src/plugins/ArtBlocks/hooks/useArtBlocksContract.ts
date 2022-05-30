import type { AbiItem } from 'web3-utils'
import { useContract } from '@masknet/plugin-infra/web3-evm'
import { useArtBlocksConstants } from '@masknet/web3-shared-evm'
import ArtBlocksCoreContractABI from '@masknet/web3-contracts/abis/ArtBlocksMinterContract.json'

import type { ArtBlocksMinterContract } from '@masknet/web3-contracts/types/ArtBlocksMinterContract'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useArtBlocksContract() {
    const { GEN_ART_721_MINTER } = useArtBlocksConstants()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useContract<ArtBlocksMinterContract>(chainId, GEN_ART_721_MINTER, ArtBlocksCoreContractABI as AbiItem[])
}
