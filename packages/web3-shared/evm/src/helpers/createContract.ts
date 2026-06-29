import { toHex } from '@masknet/shared-base'
import type { Abi, AbiFunction, AbiParameter, Address } from 'viem'
import { isValidAddress } from './address.js'
import type { Transaction } from '../types/index.js'

export interface ContractCallOptions {
    account?: string
    block?: string | number | bigint
    chainId?: string | number | bigint
    from?: string
    gas?: string | number | bigint
    gasPrice?: string | number | bigint
    maxFeePerGas?: string | number | bigint
    maxPriorityFeePerGas?: string | number | bigint
    nonce?: string | number | bigint
    value?: string | number | bigint
}

export interface ContractWriteOptions extends ContractCallOptions {
    to?: string
    data?: string
}

export interface ContractWithAddress<TAbi extends Abi = Abi> {
    address: Address
    abi: TAbi
}

export function createContractWithAddress<TAbi extends Abi>(
    address: string | undefined,
    abi: TAbi,
): ContractWithAddress<TAbi> | null {
    if (!address || !isValidAddress(address)) return null
    return {
        address: address as Address,
        abi,
    }
}

export function getFunctionInputs(abi: Abi, functionName: string) {
    const functionAbi = abi.find((item): item is AbiFunction => item.type === 'function' && item.name === functionName)
    return functionAbi?.inputs
}

export function normalizeFunctionArgs(
    args: readonly unknown[],
    parameters: readonly AbiParameter[] | undefined,
): unknown[] {
    return args.map((arg, index) => normalizeFunctionArg(arg, parameters?.[index]))
}

function normalizeFunctionArg(arg: unknown, parameter: AbiParameter | undefined): unknown {
    if (!parameter) return normalizeIntegerLike(arg)
    if (Array.isArray(arg)) {
        const childParameter = getArrayItemParameter(parameter)
        return arg.map((item, index) =>
            normalizeFunctionArg(
                item,
                childParameter ?? (isTupleParameter(parameter) ? parameter.components[index] : undefined),
            ),
        )
    }
    if (isTupleParameter(parameter)) {
        if (typeof arg !== 'object' || !arg) return arg
        return parameter.components.map((component, index) => {
            const value = Array.isArray(arg) ? arg[index] : (arg as Record<string, unknown>)[component.name ?? index]
            return normalizeFunctionArg(value, component)
        })
    }
    if (isIntegerType(parameter.type)) return normalizeIntegerLike(arg)
    return arg
}

function normalizeIntegerLike(value: unknown) {
    if (typeof value === 'object' && value && 'toString' in value && typeof value.toString === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return value.toString()
    }
    return value
}

function getArrayItemParameter(parameter: AbiParameter | undefined): AbiParameter | undefined {
    if (!parameter?.type.endsWith(']')) return
    if (parameter.type.startsWith('tuple')) {
        return {
            ...parameter,
            type: 'tuple',
        }
    }
    return {
        ...parameter,
        type: parameter.type.replace(/\[[^\]]*\]$/u, ''),
    } as AbiParameter
}

function isTupleParameter(
    parameter: AbiParameter,
): parameter is AbiParameter & { components: readonly AbiParameter[] } {
    return parameter.type === 'tuple' && 'components' in parameter && Array.isArray(parameter.components)
}

function isIntegerType(type: string) {
    return /^u?int(?:\d+)?(?:\[.*\])?$/u.test(type)
}

export function normalizeTransaction(transaction: Record<string, unknown>): Transaction {
    return Object.fromEntries(
        Object.entries(transaction)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, isTransactionQuantity(key) ? toHex(value as never) : value]),
    ) as Transaction
}

function isTransactionQuantity(key: string) {
    return ['chainId', 'gas', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas', 'nonce', 'value'].includes(key)
}
