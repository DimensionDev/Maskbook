import type { AbiItem } from 'web3-utils'
import { useContract } from '@masknet/web3-shared-evm'
import type { MaskBoxWhiteList } from '@masknet/web3-contracts/types/MaskBoxWhiteList'
import MASK_BOX_WHITELIST_ABI from '@masknet/web3-contracts/abis/MaskBoxWhiteList.json'

export function useWhitelistContract(address?: string) {
    return useContract<MaskBoxWhiteList>(address, MASK_BOX_WHITELIST_ABI as AbiItem[])
}
