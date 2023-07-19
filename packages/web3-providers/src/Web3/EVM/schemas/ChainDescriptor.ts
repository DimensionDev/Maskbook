import { z } from 'zod'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { isSameURL, type ChainDescriptor } from '@masknet/web3-shared-base'
import {
    type ChainId,
    type NetworkType,
    type SchemaType,
    EthereumMethodType,
    createJsonRpcPayload,
} from '@masknet/web3-shared-evm'
import { Duration, fetchJSON } from '../../../entry-helpers.js'

interface ChainConfig {
    name: string
    chain: string
    icon: string
    rpc: string[]
    features: Array<{ name: LiteralUnion<'EIP155' | 'EIP1559'> }>
    faucets: []
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
    infoURL: string
    shortName: string
    chainId: number
    networkId: number
    slip44: number
    ens: {
        registry: string
    }
    explorers: Array<{
        name: string
        url: string
        standard: LiteralUnion<'EIP3091'>
    }>
}

async function fetchChains() {
    return fetchJSON<ChainConfig[]>('https://chainid.network/chains.json', undefined, {
        enableCache: true,
        cacheDuration: Duration.LONG,
    })
}

async function fetchChainId(rpc: string) {
    const { result } = await fetchJSON<JsonRpcResponse>(rpc, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            createJsonRpcPayload(0, {
                method: EthereumMethodType.ETH_CHAIN_ID,
                params: [],
            }),
        ),
    })
    return Number.parseInt(result, 16)
}

export function createSchema(descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>) {
    return (
        z
            .object({
                type: z.string(),
                chainId: z.number().int().gt(0, { message: 'Incorrect chain Id.' }),
                coinMarketCapChainId: z.string(),
                coinGeckoChainId: z.string(),
                coinGeckoPlatformId: z.string(),
                name: z.string().trim().nonempty(),
                color: z.string().optional(),
                fullName: z.string().trim().optional(),
                shortName: z.string().trim().optional(),
                network: z.union([z.literal('mainnet'), z.literal('testnet')]),
                nativeCurrency: z.object({
                    name: z.string(),
                    symbol: z.string(),
                    decimals: z.number(),
                }),
                rpcUrl: z
                    .string()
                    .trim()
                    .url('Invalid URL')
                    .refine((rpc: string) => rpc.startsWith('https://'), 'Required HTTPs URL'),
                iconUrl: z.string().trim().optional(),
                explorerUrl: z.object({
                    url: z.string().url(),
                    parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
                }),
                features: z.array(z.string()).optional(),
                isCustomized: z.boolean(),
            })

            //  Validate the chain id matches with the RPC response.
            .superRefine(async (schema, context) => {
                try {
                    const chainId = await fetchChainId(schema.rpcUrl)
                    if (chainId === schema.chainId) return

                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['chainId'],
                        message: `The RPC URL you have entered returned a different chain ID (${chainId}). Please update the Chain ID to match the RPC URL of the network you are trying to add.`,
                    })
                } catch {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['chainId'],
                        message: 'Failed to fetch chain Id.',
                    })
                }
            })

            // Validate the currency symbol
            .superRefine(async (schema, context) => {
                const chains = await fetchChains()

                const chain = chains.find((x) => x.chainId === schema.chainId)
                if (!chain) return

                if (chain.nativeCurrency.symbol !== schema.nativeCurrency.symbol) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['nativeCurrency', 'symbol'],
                        message: `The network with chain ID ${schema.chainId} may use a different currency symbol (${chain.nativeCurrency.symbol}) than the one you have entered. Please verify before continuing.`,
                    })
                }
            })

            // Validate duplication of rpcUrl
            .superRefine(async (schema, context) => {
                const conflict = descriptors.find((x) => isSameURL(x.rpcUrl, schema.rpcUrl))

                if (conflict) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['rpcUrl'],
                        message: `The rpcUrl is already used by ${conflict.name} network.`,
                    })
                }
            })
    )
}
