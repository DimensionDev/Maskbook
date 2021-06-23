import type { AbiItem } from 'web3-utils'
import BulkCheckoutABI from '@masknet/contracts/abis/BulkCheckout.json'
import type { BulkCheckout } from '@masknet/contracts/types/BulkCheckout'
import { GITCOIN_CONSTANT } from '../constants'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useBulkCheckoutContract() {
    const address = useConstant(GITCOIN_CONSTANT).BULK_CHECKOUT_ADDRESS
    return useContract<BulkCheckout>(address, BulkCheckoutABI as AbiItem[])
}
