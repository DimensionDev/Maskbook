import type { AbiItem } from 'web3-utils'
import BulkCheckoutABI from '@dimensiondev/contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@dimensiondev/contracts/types/BulkCheckout'
import { GITCOIN_CONSTANT } from '../constants'
import { useConstant, useContract } from '@dimensiondev/web3-shared'

export function useBulkCheckoutContract() {
    const address = useConstant(GITCOIN_CONSTANT, 'BULK_CHECKOUT_ADDRESS')
    return useContract<BulkCheckout>(address, BulkCheckoutABI as AbiItem[])
}
