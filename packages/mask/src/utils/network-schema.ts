import { EthereumMethodType, createJsonRpcPayload } from '@masknet/web3-shared-evm'
import { z } from 'zod'
import type { I18NFunction } from './i18n-next-ui.js'

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

export async function fetchChains(): Promise<ChainConfig[]> {
    const res = await fetch('https://chainid.network/chains.json')
    return res.json()
}

type NameValidator = (name: string) => boolean | Promise<boolean>

/**
 * schema with basic validation
 * duplicated name validator is injected as dependency, both frontend and
 * background can provide their own validator
 */
export function createBaseSchema(t: I18NFunction, duplicateNameValidator: NameValidator) {
    const schema = z.object({
        name: z.string().trim().nonempty().refine(duplicateNameValidator, t('network_already_exists')),
        rpc: z
            .string()
            .trim()
            .url(t('incorrect_rpc_url'))
            .refine((rpc) => rpc.startsWith('https'), t('rpc_requires_https')),
        chainId: z.union([
            z
                .string()
                .trim()
                .regex(/^\d+|0x[\da-e]$/i, t('incorrect_chain_id'))
                .transform((v) => Number.parseInt(v, v.startsWith('0x') ? 16 : 10)),
            z.number(),
        ]),
        currencySymbol: z.string().optional(),
        explorer: z.union([z.string().url(t('incorrect_explorer_url')), z.literal('')]),
    })
    return schema
}

export function createSchema(t: I18NFunction, duplicateNameValidator: NameValidator) {
    const baseSchema = createBaseSchema(t, duplicateNameValidator)
    const schema = baseSchema
        .superRefine(async (schema, context) => {
            if (!schema.rpc || !schema.chainId) return true
            let rpcId: number
            try {
                const res = await fetch(schema.rpc, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        Origin: location.origin,
                    },
                    body: JSON.stringify(
                        createJsonRpcPayload(0, {
                            method: EthereumMethodType.ETH_CHAIN_ID,
                            params: [],
                        }),
                    ),
                })
                const json = (await res.json()) as { result: string }
                rpcId = Number.parseInt(json.result, 16)
            } catch {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rpc'],
                    message: t('failed_to_fetch_chain_id'),
                })
                return
            }
            if (rpcId !== schema.chainId) {
                // Background can pass i18n params by params field to frontend
                const params = { chain_id: rpcId }
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['chainId'],
                    message: t('rpc_return_different_chain_id', params),
                    params,
                })
                return
            }
            return true
        })
        .superRefine(async (schema, context) => {
            if (!schema.chainId || !schema.currencySymbol) return true
            try {
                const chains = await fetchChains()
                const match = chains.find((chain) => chain.chainId === schema.chainId)
                if (!match) return true
                if (match.nativeCurrency.symbol !== schema.currencySymbol) {
                    // ditto
                    const params = { chain_id: match.chainId, symbol: match.nativeCurrency.symbol }
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['currencySymbol'],
                        message: t('rpc_return_different_symbol', params),
                        params,
                    })
                }
            } catch {
                // Ignore
            }
            return true
        })
    return schema
}
