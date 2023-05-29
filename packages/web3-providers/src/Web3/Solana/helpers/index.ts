import {
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    leftShift,
    multipliedBy,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createClientEndpoint, SchemaType } from '@masknet/web3-shared-solana'
import type { RpcOptions } from '../types/index.js'

export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const response = await globalThis.fetch(createClientEndpoint(ChainId.Mainnet), {
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
