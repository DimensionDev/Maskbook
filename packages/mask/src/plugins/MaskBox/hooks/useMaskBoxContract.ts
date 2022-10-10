import type { AbiItem } from 'web3-utils'
import type { MaskBox } from '@masknet/web3-contracts/types/MaskBox'
import MASK_BOX_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import { useMaskBoxConstants, ChainId } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'

export function useMaskBoxContract() {
    const chainId = useChainId()
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants(chainId)
    return useContract<MaskBox>(chainId as ChainId, MASK_BOX_CONTRACT_ADDRESS, MASK_BOX_ABI as AbiItem[])
}
