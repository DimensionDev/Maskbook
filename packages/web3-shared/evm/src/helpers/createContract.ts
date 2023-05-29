import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string | undefined, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}
