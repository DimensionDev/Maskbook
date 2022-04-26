import type { AbiItem } from 'web3-utils'
import BulkCheckoutABI from '@masknet/web3-contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/web3-contracts/types/BulkCheckout'
import { ChainId, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useBulkCheckoutContract(chainId: ChainId) {
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()
    return useContract<BulkCheckout>(chainId, BULK_CHECKOUT_ADDRESS, BulkCheckoutABI as AbiItem[])
}
