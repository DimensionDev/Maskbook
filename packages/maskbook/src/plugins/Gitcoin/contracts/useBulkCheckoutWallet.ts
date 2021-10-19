import BulkCheckoutABI from '@masknet/web3-contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/web3-contracts/types/BulkCheckout'
import { useContract, useGitcoinConstants } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useBulkCheckoutContract() {
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()
    return useContract<BulkCheckout>(BULK_CHECKOUT_ADDRESS, BulkCheckoutABI as AbiItem[])
}
