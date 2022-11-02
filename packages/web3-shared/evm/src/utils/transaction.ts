import type Web3 from 'web3'
import { identity, pickBy } from 'lodash-unified'
import { AbiItem, hexToNumber, sha3, toHex } from 'web3-utils'
import type {
    BaseContract,
    NonPayableTransactionObject,
    PayableTransactionObject,
    PayableTx,
} from '@masknet/web3-contracts/types/types'
import { isValidAddress, isEmptyHex } from './address.js'
import { Transaction, EthereumMethodType, ChainId } from '../types/index.js'
import { ZERO_ADDRESS } from '../constants/index.js'

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

export function getData(config: Transaction) {
    const { data } = config
    if (!data) return
    if (isEmptyHex(data)) return
    if (!data.startsWith('0x')) return `0x${data}`
    return data
}

export function getTo(config: Transaction) {
    const { to } = config
    if (!to) return ZERO_ADDRESS
    if (isEmptyHex(to)) return ZERO_ADDRESS
    return to
}

export function getFunctionSignature(tx: Transaction) {
    const data = getData(tx)
    return data?.slice(0, 10)
}

export function getFunctionParameters(tx: Transaction) {
    const data = getData(tx)
    return data?.slice(10)
}

export function getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>) {
    if (!chainId || !transaction) return
    const { from, to, data, value } = transaction
    return sha3([chainId, from, to, data || '0x0', toHex((value as string) || '0x0') || '0x0'].join('_')) ?? undefined
}

export function encodeTransaction(transaction: Transaction): PayableTx & {
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
} {
    return pickBy(
        {
            from: transaction?.from as string | undefined,
            to: transaction.to,
            value: transaction?.value ? toHex(transaction.value) : undefined,
            gas: transaction?.gas ? toHex(transaction.gas) : undefined,
            gasPrice: transaction?.gasPrice ? toHex(transaction.gasPrice) : undefined,
            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas
                ? toHex(transaction.maxPriorityFeePerGas)
                : undefined,
            maxFeePerGas: transaction?.maxFeePerGas ? toHex(transaction.maxFeePerGas) : undefined,
            data: transaction.data,
            nonce: transaction?.nonce ? toHex(transaction.nonce) : undefined,
            chainId: transaction?.chainId ? toHex(transaction.chainId) : undefined,
        },
        identity,
    )
}

export async function encodeContractTransaction(
    contract: BaseContract,
    transaction: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    const tx: PayableTx & {
        maxPriorityFeePerGas?: string
        maxFeePerGas?: string
    } = {
        from: (overrides?.from as string | undefined) ?? contract.defaultAccount ?? '',
        to: contract.options.address,
        data: transaction.encodeABI(),
        value: overrides?.value ? toHex(overrides.value) : undefined,
        gas: overrides?.gas ? toHex(overrides.gas) : undefined,
        gasPrice: overrides?.gasPrice ? toHex(overrides.gasPrice) : undefined,
        maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas ? toHex(overrides.maxPriorityFeePerGas) : undefined,
        maxFeePerGas: overrides?.maxFeePerGas ? toHex(overrides.maxFeePerGas) : undefined,
        nonce: overrides?.nonce ? toHex(overrides.nonce) : undefined,
        chainId: overrides?.chainId ? toHex(overrides.chainId) : undefined,
    }

    if (!tx.gas) {
        tx.gas = await transaction.estimateGas({
            from: tx.from as string | undefined,
            to: tx.to as string | undefined,
            data: tx.data as string | undefined,
            value: tx.value,
            // rpc hack, alchemy rpc must pass gas parameter
            gas: hexToNumber(overrides?.chainId ?? '0x0') === ChainId.Astar ? '0x135168' : undefined,
        })
    }

    return encodeTransaction(tx)
}

export async function sendTransaction(
    contract: BaseContract | null,
    transaction?: PayableTransactionObject<unknown> | NonPayableTransactionObject<unknown>,
    overrides?: Partial<Transaction>,
) {
    if (!contract || !transaction) throw new Error('Invalid contract or transaction.')
    const tx = await encodeContractTransaction(contract, transaction, overrides)
    const receipt = await transaction.send(tx as PayableTx)
    return receipt?.transactionHash ?? ''
}

export function createContract<T extends BaseContract>(web3: Web3 | null, address: string, ABI: AbiItem[]) {
    if (!address || !isValidAddress(address) || !web3) return null
    const contract = new web3.eth.Contract(ABI, address) as unknown as T
    return contract
}
