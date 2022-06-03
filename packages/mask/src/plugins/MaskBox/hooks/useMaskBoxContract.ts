import type { AbiItem } from 'web3-utils'
import type { MaskBox } from '@masknet/web3-contracts/types/MaskBox'
import MASK_BOX_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import { useMaskBoxConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'
import { TargetChainIdContext } from '../contexts'

export function useMaskBoxContract() {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants(chainId)
    return useContract<MaskBox>(chainId, MASK_BOX_CONTRACT_ADDRESS, MASK_BOX_ABI as AbiItem[])
}
