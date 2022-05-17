import BulkCheckoutABI from '@masknet/web3-contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/web3-contracts/types/BulkCheckout'
import { useChainId, useContract, useGitcoinConstants } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useBulkCheckoutContract() {
    const chainId = useChainId()
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()
    return useContract<BulkCheckout>(chainId, BULK_CHECKOUT_ADDRESS, BulkCheckoutABI as AbiItem[])
}
