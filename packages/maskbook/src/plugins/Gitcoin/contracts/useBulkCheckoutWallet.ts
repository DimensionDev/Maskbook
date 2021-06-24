import type { AbiItem } from 'web3-utils'
import BulkCheckoutABI from '@masknet/contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/contracts/types/BulkCheckout'
import { GITCOIN_CONSTANT } from '../constants'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useBulkCheckoutContract() {
    const { BULK_CHECKOUT_ADDRESS } = useConstant(GITCOIN_CONSTANT)
    return useContract<BulkCheckout>(BULK_CHECKOUT_ADDRESS, BulkCheckoutABI as AbiItem[])
}
