import type Web3 from 'web3'
import { AbiItem, sha3, toHex } from 'web3-utils'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { isValidAddress } from './address.js'
import { Transaction, EthereumMethodType, ChainId } from '../types/index.js'

const RISK_METHOD_LIST = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.PERSONAL_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.ETH_DECRYPT,
    EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
    EthereumMethodType.ETH_SEND_TRANSACTION,
]

export function isRiskMethod(method: EthereumMethodType) {
    return RISK_METHOD_LIST.includes(method)
}

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}

export function getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>) {
    if (!chainId || !transaction) return
    const { from, to, data, value } = transaction
    return sha3([chainId, from, to, data || '0x0', toHex((value as string) || '0x0') || '0x0'].join('_')) ?? undefined
}
