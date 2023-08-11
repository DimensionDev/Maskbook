import { fetchChainId } from '@masknet/web3-providers/helpers'
import { isSameURL, type ReasonableNetwork } from '@masknet/web3-shared-base'
import { getRPCConstant, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { z } from 'zod'
import type { I18NFunction } from '../../../../../utils/i18n-next-ui.js'

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
                .regex(/^\d+|0x[\da-f]$/i, t('invalid_number'))
                .transform((v) => Number.parseInt(v, v.startsWith('0x') ? 16 : 10)),
            z.number(),
        ]),
        currencySymbol: z.string().optional(),
        explorer: z.union([z.string().url(t('incorrect_explorer_url')), z.literal('')]),
    })
    return schema
}

export function createSchema(
    t: I18NFunction,
    duplicateNameValidator: NameValidator,
    networks: Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>,
    editingId: string | undefined,
) {
    const baseSchema = createBaseSchema(t, duplicateNameValidator)
    const schema = baseSchema
        .superRefine(async (schema, context) => {
            if (!schema.rpc) return true
            let rpcChainId: number
            try {
                rpcChainId = await fetchChainId(schema.rpc)
            } catch (err) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rpc'],
                    message: t('failed_to_fetch_chain_id'),
                })
                return false
            }
            if (!schema.chainId) return true
            if (rpcChainId !== schema.chainId) {
                // Background can pass i18n params by params field to frontend
                const params = { chain_id: rpcChainId }
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
        .superRefine((schema, context) => {
            const { rpc } = schema
            const network = networks.find((network) => isSameURL(network.rpcUrl, rpc) && network.ID !== editingId)
            if (network) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rpc'],
                    message: t('rpc_url_is_used_by', { name: network.name }),
                })
                return false
            } else {
                networks.some((network) => {
                    if (getRPCConstant(network.chainId, 'RPC_URLS')?.includes(rpc)) {
                        context.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['rpc'],
                            message: t('rpc_url_is_used_by', { name: network.name }),
                        })
                        return true
                    }
                    return false
                })
            }
            return true
        })
    return schema
}
