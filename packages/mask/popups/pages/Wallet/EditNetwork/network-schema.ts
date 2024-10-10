import { fetchChainId } from '@masknet/web3-providers/helpers'
import { isSameURL, type ReasonableNetwork } from '@masknet/web3-shared-base'
import { getRPCConstant, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { z } from 'zod'
import { msg } from '@lingui/macro'
import { type I18nContext } from '@lingui/react'

type NameValidator = (name: string) => boolean | Promise<boolean>

/**
 * schema with basic validation
 * duplicated name validator is injected as dependency, both frontend and
 * background can provide their own validator
 */
function createBaseSchema(_: I18nContext['_'], duplicateNameValidator: NameValidator) {
    const schema = z.object({
        name: z
            .string()
            .trim()
            .nonempty()
            .refine(duplicateNameValidator, _(msg`This network name already exists`)),
        rpc: z
            .string()
            .trim()
            .url(_(msg`Invalid RPC URL.`))
            .refine((rpc) => rpc.startsWith('https'), _(msg`URLs require the appropriate HTTPS prefix.`)),
        chainId: z.union([
            z
                .string()
                .trim()
                .regex(/^\d+|0x[\da-f]$/i, _(msg`Invalid number`))
                .transform((v) => Number.parseInt(v, v.startsWith('0x') ? 16 : 10)),
            z.number(),
        ]),
        currencySymbol: z.string().optional(),
        explorer: z.string().url(_(msg`Invalid Block Explorer URL.`)),
    })
    return schema
}

export function createSchema(
    _: I18nContext['_'],
    duplicateNameValidator: NameValidator,
    networks: Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>,
    editingId: string | undefined,
) {
    const baseSchema = createBaseSchema(_, duplicateNameValidator)
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
                    message: _(msg`Could not fetch chain ID. Is your RPC URL correct?`),
                })
                return false
            }
            if (!schema.chainId) return true
            if (rpcChainId !== schema.chainId) {
                // Background can pass i18n params by params field to frontend
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['chainId'],
                    message: _(
                        msg`The RPC URL you have entered returned a different chain ID (${rpcChainId}). Please update the Chain ID to match the RPC URL of the network you are trying to add.`,
                    ),
                    params: { chain_id: rpcChainId },
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
                    message: _(msg`This RPC URL is currently used by the ${network.name} network`),
                })
                return false
            } else {
                networks.some((network) => {
                    if (getRPCConstant(network.chainId, 'RPC_URLS')?.includes(rpc)) {
                        context.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['rpc'],
                            message: _(msg`This RPC URL is currently used by the ${network.name} network`),
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
