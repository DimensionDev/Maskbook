import BulkCheckoutABI from '@masknet/contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/contracts/types/BulkCheckout'
import { useContract, useGitcoinConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useBulkCheckoutContract() {
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()
    return useContract<BulkCheckout>(BULK_CHECKOUT_ADDRESS, BulkCheckoutABI as AbiItem[])
}
