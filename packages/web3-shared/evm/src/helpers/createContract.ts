import type { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'
import type { Web3 } from '../libs/index.js'
import type { ContractInitOptions } from 'web3-types'

export function createContract<T extends BaseContract>(
    web3: Web3 | null,
    address: string | undefined,
    ABI: AbiItem[],
    options?: ContractInitOptions,
) {
    if (!address || !isValidAddress(address) || !web3) return null
    return new Contract(ABI, address, options) as unknown as T
}
