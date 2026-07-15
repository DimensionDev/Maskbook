import type { ChainId } from '@masknet/web3-shared-evm'
import { FireflyEmbeddedWalletClient } from './EmbeddedWalletClient.js'
import type { EIP1193RequestProvider, EvmTransaction } from '../types/FireflyEmbedded.js'

/**
 * Current chain of the embedded wallet. Chain switching is local-only: the
 * actual network switch happens through the Mask wallet plumbing, and the
 * Firefly signing endpoints are chain-agnostic (each tx carries its own
 * `chain_id`). This value only backs `eth_chainId` responses.
 */
let currentChainId: ChainId = 1 /* ChainId.Mainnet */

function toDecimalChainId(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const parsed = Number.parseInt(value, value.startsWith('0x') ? 16 : 10)
    return Number.isNaN(parsed) ? undefined : parsed.toString()
}

/**
 * Coerces a primitive EIP-1193 field (hex string / number / bigint / boolean)
 * to a string. Throws on objects so we never silently send `[object Object]`
 * to the signing backend.
 */
function primitiveToString(value: unknown): string {
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
            return String(value)
        default:
            throw new TypeError(`Expected a primitive value, received ${typeof value}`)
    }
}

/** Builds the backend `EvmTransaction` from an EIP-1193 `eth_sendTransaction`-style param. */
function buildEvmTransaction(params: unknown): EvmTransaction {
    const raw = (Array.isArray(params) ? params[0] : params) as { [property: string]: unknown } & {
        from?: string
        to?: string
    }
    const transaction: EvmTransaction = {
        from: String(raw.from ?? ''),
        to: String(raw.to ?? ''),
        chain_id: toDecimalChainId(raw.chainId) ?? currentChainId.toString(),
    }
    if (raw.data) transaction.data = primitiveToString(raw.data)
    if (raw.value !== undefined && raw.value !== null) transaction.value = primitiveToString(raw.value)
    if (raw.nonce !== undefined && raw.nonce !== null) transaction.nonce = Number(raw.nonce)

    const gas = raw.gas ?? raw.gasLimit
    if (gas !== undefined && gas !== null) transaction.gas_limit = primitiveToString(gas)
    if (raw.gasPrice) transaction.gasPrice = primitiveToString(raw.gasPrice)
    if (raw.maxFeePerGas) transaction.max_fee_per_gas = primitiveToString(raw.maxFeePerGas)
    if (raw.maxPriorityFeePerGas) transaction.max_priority_fee_per_gas = primitiveToString(raw.maxPriorityFeePerGas)
    if (raw.type !== undefined && raw.type !== null) {
        const type = typeof raw.type === 'string' ? Number.parseInt(raw.type, 16) : Number(raw.type)
        if (type === 0 || type === 1 || type === 2 || type === 4) transaction.type = type
    }
    return transaction
}

/**
 * EIP-1193 provider that maps signing/account RPC methods to the Firefly
 * embedded wallet backend. Read RPC is intentionally not supported here — it is
 * served by Mask's readonly providers.
 */
export class FireflyEmbeddedProvider implements EIP1193RequestProvider {
    constructor(private address: string) {}

    async request(args: { method: string; params?: unknown[] | object }): Promise<any> {
        const { method, params } = args
        switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
                return [this.address]
            case 'eth_chainId':
                return `0x${currentChainId.toString(16)}`
            case 'personal_sign': {
                const message = (params as unknown[])?.[0] as string
                return FireflyEmbeddedWalletClient.personalSign(message)
            }
            case 'eth_signTypedData_v4':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData': {
                const raw = (params as unknown[])?.[1]
                // `raw` is either the EIP-712 typed-data object or an already-serialized
                // JSON string; JSON.stringify handles both without risking `[object Object]`.
                const jsonStr = typeof raw === 'string' ? raw : JSON.stringify(raw ?? {})
                return FireflyEmbeddedWalletClient.signTypedDataV4(jsonStr)
            }
            case 'eth_signTransaction':
                return FireflyEmbeddedWalletClient.signTransaction(buildEvmTransaction(params))
            case 'eth_sendTransaction':
                return FireflyEmbeddedWalletClient.sendTransaction(buildEvmTransaction(params))
            case 'wallet_switchEthereumChain': {
                const chainIdHex = (params as Array<{ chainId?: string }> | undefined)?.[0]?.chainId
                const decimal = toDecimalChainId(chainIdHex)
                if (decimal) currentChainId = Number.parseInt(decimal, 10) as ChainId
                return null
            }
            default:
                throw new Error(`Unsupported RPC method: ${method}`)
        }
    }

    // EIP-1193 event surface — the embedded wallet emits no events.
    on(_event: string, _handler: (...args: unknown[]) => void): void {}
    off(_event: string, _handler: (...args: unknown[]) => void): void {}
    removeListener(_event: string, _handler: (...args: unknown[]) => void): void {}
}

/** Wallet shape consumed by the discovery hook and signing flows. */
export interface FireflyEmbeddedWallet {
    address: string
    chainType: 'ethereum'
    isConnected: true
    getEthereumProvider(): Promise<FireflyEmbeddedProvider>
    switchChain(chainId: ChainId): Promise<void>
}

export function createFireflyEmbeddedWallet(address: string): FireflyEmbeddedWallet {
    return {
        address,
        chainType: 'ethereum',
        isConnected: true,
        getEthereumProvider: async () => new FireflyEmbeddedProvider(address),
        switchChain: async (chainId: ChainId) => {
            currentChainId = chainId
        },
    }
}
