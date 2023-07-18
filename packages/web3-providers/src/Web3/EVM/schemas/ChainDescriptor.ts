import { z } from 'zod'
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

export const ChainDescriptorSchema = z.object({
    type: z.string(),
    chainId: z.number().gt(0, { message: 'Incorrect chain Id.' }),
    coinMarketCapChainId: z.string(),
    coinGeckoChainId: z.string(),
    coinGeckoPlatformId: z.string(),
    name: z.string(),
    color: z.string().optional(),
    fullName: z.string().optional(),
    shortName: z.string().optional(),
    network: z.union([z.literal('mainnet'), z.literal('testnet')]),
    nativeCurrency: z.object({}),
    rpcUrl: z
        .string()
        .url('Invalid URL')
        .refine((rpc) => rpc.startsWith('https://'), 'Required HTTPs URL'),
    iconUrl: z.string().optional(),
    explorerUrl: z.object({
        url: z.string(),
        parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    }),
    features: z.array(z.string()).optional(),
    isCustomized: z.boolean(),
})
