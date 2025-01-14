import {
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    leftShift,
    multipliedBy,
    TokenType,
} from '@masknet/web3-shared-base'
import type * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { type ChainId, createClientEndpoint, SchemaType } from '@masknet/web3-shared-solana'
import type { RpcOptions } from '../types/index.js'

export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const response = await globalThis.fetch(createClientEndpoint(chainId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            ...options,
            jsonrpc: '2.0',
            id: 0,
        }),
    })
    const json = await response.json()
    if (json.error) throw new Error(json.message || 'Fails in requesting RPC')
    return json
}

export function createFungibleToken(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURL?: string,
): FungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema: SchemaType.Fungible,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    }
}

export function createFungibleAsset(
    token: FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: {
        [key in CurrencyType]?: string
    },
): FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance,
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, token.decimals)).toFixed(),
        },
    }
}

export interface Solana {
    isConnected: boolean
    publicKey: SolanaWeb3.PublicKey
    connect(): Promise<void>
    signTransaction: <T extends SolanaWeb3.VersionedTransaction>(transaction: T) => Promise<T>
    signAllTransactions: <T extends SolanaWeb3.VersionedTransaction>(transactions: T[]) => Promise<T[]>
    signAndSendTransaction: <T extends SolanaWeb3.VersionedTransaction>(transaction: T) => Promise<string>
}

export async function getSolana() {
    const solana = Reflect.get(window, 'solana') as Solana | undefined
    console.log(solana)
    if (!solana) throw new Error('No solana client found')
    if (!solana.isConnected) await solana.connect()

    return solana
}
