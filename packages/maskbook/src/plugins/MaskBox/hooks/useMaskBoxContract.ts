import type { AbiItem } from 'web3-utils'
import type { MaskBox } from '@masknet/web3-contracts/types/MaskBox'
import MASK_BOX_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import { useContract, useMaskBoxConstants } from '@masknet/web3-shared'

export function useMaskBoxContract() {
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants()
    return useContract<MaskBox>(MASK_BOX_CONTRACT_ADDRESS, MASK_BOX_ABI as AbiItem[])
}
