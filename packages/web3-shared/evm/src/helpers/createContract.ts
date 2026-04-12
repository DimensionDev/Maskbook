import type { ContractOptions } from 'web3-eth-contract'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'
import type { Web3 } from '../libs/index.js'
import type { Abi } from 'viem'

export function createContract<T extends BaseContract>(
    web3: Web3 | null,
    address: string | undefined,
    abi: Abi,
    options?: ContractOptions,
) {
    if (!address || !isValidAddress(address) || !web3) return null
    return new web3.eth.Contract(abi as any, address, options) as unknown as T
}
