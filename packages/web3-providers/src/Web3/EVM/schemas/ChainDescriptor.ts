import { z } from 'zod'
import { isSameURL, type ChainDescriptor } from '@masknet/web3-shared-base'
import { type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'

export function createSchema(descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>) {
    return (
        z
            .object({
                type: z.string(),
                chainId: z.number().int().gt(0, { message: 'Incorrect chain Id.' }),
                coinMarketCapChainId: z.string().optional(),
                coinGeckoChainId: z.string().optional(),
                coinGeckoPlatformId: z.string().optional(),
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
                    url: z.union([z.string().url(), z.literal('')]),
                    parameters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
                }),
                features: z.array(z.string()).optional(),
                isCustomized: z.boolean(),
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
