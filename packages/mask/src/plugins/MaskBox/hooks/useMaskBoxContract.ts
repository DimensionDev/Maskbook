import type { AbiItem } from 'web3-utils'
import type { MaskBox } from '@masknet/web3-contracts/types/MaskBox'
import MASK_BOX_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import { useChainId, useContract, useMaskBoxConstants } from '@masknet/web3-shared-evm'

export function useMaskBoxContract() {
    const chainId = useChainId()
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants()
    return useContract<MaskBox>(chainId, MASK_BOX_CONTRACT_ADDRESS, MASK_BOX_ABI as AbiItem[])
}
