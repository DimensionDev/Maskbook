import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { GITCOIN_CONSTANT } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import BulkCheckoutABI from '../../../contracts/bulk-checkout/BulkCheckout.json'
import type { BulkCheckout } from '../../../contracts/bulk-checkout/BulkCheckout'

export function useBulkCheckoutContract() {
    const address = useConstant(GITCOIN_CONSTANT, 'BULK_CHECKOUT_ADDRESS')
    return useContract<BulkCheckout>(address, BulkCheckoutABI as AbiItem[])
}
