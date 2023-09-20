import type { AbiItem } from 'web3-utils'
import type { ContractOptions } from 'web3-eth-contract'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'
import type { Web3 } from '../libs/index.js'

export function createContract<T extends BaseContract>(
    web3: Web3 | null,
    address: string | undefined,
    ABI: AbiItem[],
    options?: ContractOptions,
) {
    if (!address || !isValidAddress(address) || !web3) return null
    return new web3.eth.Contract(ABI, address, options) as unknown as T
}
