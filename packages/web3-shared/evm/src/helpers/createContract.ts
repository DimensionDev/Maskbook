import { toHex } from '@masknet/shared-base'
import type {
    Abi,
    AbiFunction,
    AbiParameter,
    AbiStateMutability,
    Address,
    Client,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
    PublicActions,
    WalletActions,
} from 'viem'
import { encodeFunctionData } from 'viem'
import { isValidAddress } from './address.js'
import type { Transaction } from '../types/index.js'

type ViemClient = Client & PublicActions & WalletActions

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

export interface ContractDescriptor<TAbi extends Abi = Abi> {
    address: Address
    abi: TAbi
}

export function createContractDescriptor<TAbi extends Abi>(
    address: string | undefined,
    abi: TAbi,
): ContractDescriptor<TAbi> | null {
    if (!address || !isValidAddress(address)) return null
    return {
        address: address as Address,
        abi,
    }
}

export async function readContract<TAbi extends Abi>(
    client: ViemClient,
    contract: ContractDescriptor<TAbi> | null | undefined,
    functionName: ContractFunctionName<TAbi, 'pure' | 'view'>,
    args: ContractFunctionArgs<TAbi, 'pure' | 'view', typeof functionName> = [] as unknown as ContractFunctionArgs<
        TAbi,
        'pure' | 'view',
        typeof functionName
    >,
    options?: ContractCallOptions,
) {
    if (!contract) return
    const functionAbi = getFunctionAbi(contract.abi, functionName)
    return client.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: normalizeFunctionName(functionName),
        args: normalizeFunctionArgs(args as readonly unknown[], functionAbi?.inputs),
        account: (options?.account ?? options?.from) as Address | undefined,
        blockNumber: normalizeBlockNumber(options?.block),
        blockTag: normalizeBlockTag(options?.block),
    } as Parameters<typeof client.readContract>[0]) as Promise<
        ContractFunctionReturnType<TAbi, 'pure' | 'view', typeof functionName, typeof args>
    >
}

export async function estimateContractGas<TAbi extends Abi>(
    client: ViemClient,
    contract: ContractDescriptor<TAbi> | null | undefined,
    functionName: ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
    args: ContractFunctionArgs<
        TAbi,
        'nonpayable' | 'payable',
        typeof functionName
    > = [] as unknown as ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', typeof functionName>,
    options?: ContractCallOptions,
) {
    if (!contract) return
    const functionAbi = getFunctionAbi(contract.abi, functionName)
    const gas = await client.estimateContractGas({
        address: contract.address,
        abi: contract.abi,
        functionName: normalizeFunctionName(functionName),
        args: normalizeFunctionArgs(args as readonly unknown[], functionAbi?.inputs),
        account: (options?.account ?? options?.from) as Address | undefined,
        value: typeof options?.value === 'undefined' ? undefined : BigInt(toHex(options.value)),
    } as Parameters<typeof client.estimateContractGas>[0])
    return Number(gas)
}

export function encodeContractFunctionData<TAbi extends Abi>(
    abi: TAbi,
    functionName: ContractFunctionName<TAbi>,
    args: ContractFunctionArgs<TAbi, AbiStateMutability, typeof functionName> = [] as unknown as ContractFunctionArgs<
        TAbi,
        AbiStateMutability,
        typeof functionName
    >,
) {
    const functionAbi = getFunctionAbi(abi, functionName)
    return encodeFunctionData({
        abi,
        functionName: normalizeFunctionName(functionName),
        args: normalizeFunctionArgs(args as readonly unknown[], functionAbi?.inputs),
    } as Parameters<typeof encodeFunctionData>[0])
}

export function createTransactionRequest<TAbi extends Abi>(
    contract: ContractDescriptor<TAbi> | null | undefined,
    functionName: ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
    args: ContractFunctionArgs<
        TAbi,
        'nonpayable' | 'payable',
        typeof functionName
    > = [] as unknown as ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', typeof functionName>,
    options?: ContractWriteOptions,
): Transaction | undefined {
    if (!contract) return
    return normalizeTransaction({
        ...options,
        from: options?.from ?? options?.account,
        to: contract.address,
        data: encodeContractFunctionData(contract.abi, functionName, args),
    })
}

function normalizeFunctionName(functionName: string) {
    const signatureStart = functionName.indexOf('(')
    return signatureStart === -1 ? functionName : functionName.slice(0, signatureStart)
}

function getFunctionAbi(abi: Abi, functionName: string) {
    const functions = abi.filter((item): item is AbiFunction => item.type === 'function')
    if (!functionName.includes('(')) return functions.find((item) => item.name === functionName)
    return functions.find((item) => formatFunctionSignature(item) === functionName)
}

function formatFunctionSignature(item: AbiFunction) {
    return `${item.name}(${item.inputs.map(formatAbiParameter).join(',')})`
}

function formatAbiParameter(parameter: AbiParameter): string {
    if (!isTupleParameter(parameter)) return parameter.type
    return `(${(parameter.components ?? []).map(formatAbiParameter).join(',')})`
}

function normalizeFunctionArgs(args: readonly unknown[], parameters: readonly AbiParameter[] | undefined): unknown[] {
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

function normalizeBlockNumber(block: string | number | bigint | undefined) {
    if (typeof block === 'bigint') return block
    if (typeof block === 'number') return BigInt(block)
    if (typeof block === 'string' && /^\d+$/u.test(block)) return BigInt(block)
    if (typeof block === 'string' && /^0x[\da-f]+$/iu.test(block)) return BigInt(block)
    return
}

function normalizeBlockTag(block: string | number | bigint | undefined) {
    if (typeof block !== 'string') return
    if (/^\d+$/u.test(block) || /^0x[\da-f]+$/iu.test(block)) return
    return block as never
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
