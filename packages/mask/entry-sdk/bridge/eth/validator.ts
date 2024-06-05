import { MaskEthereumProviderRpcError, fromMessage, ErrorCode } from '@masknet/sdk'
import type { Result } from 'ts-results-es'
import z, { type ZodError } from 'zod'
import { getMessage } from 'eip-712'

export const requestSchema = z.object({
    method: z.string().nonempty(),
    params: z.object({}).passthrough().or(z.array(z.unknown())).nullish().optional(),
})
export function fromZodError(error: ZodError) {
    const m = fromMessage(error.message)
    if (m) return m
    console.error(...error.issues)
    const message =
        'InvalidParams: ' +
        error.issues.map((issue) => `(${issue.code})${issue.path.join('.')}: ${issue.message}`).join('; ')
    return m || new MaskEthereumProviderRpcError(ErrorCode.InvalidParams, message)
}

namespace _ {
    export const httpsURL = z.string().startsWith('https://').url()
    export const hex = z.string().regex(/0x[\da-f]*/g)
    export const hexAllowCap = z.string().regex(/^0x[\dA-Fa-f]+$/g)
    export const unpadded_hex = z.string().regex(/^0x([1-9a-f]+[\da-f]*|0)$/g)

    export const address = z.string().regex(/^0x[\d,A-Fa-f]{40}$/g)
    export const block_hash = z
        .string()
        .regex(/^0x[\da-f]{64}$/g)
        .describe('block hash')
    const block_tag = z.enum(['earliest', 'finalized', 'safe', 'latest', 'pending']).describe('block_tag')
    const block_number = unpadded_hex.describe('block_number')
    export const block = z.union([block_tag, block_number, block_hash]).describe('Block')
    export const block_number_or_tag = z.union([block_tag, block_number]).describe('Block')
    export const chainId = z.preprocess(
        // number to string is not defined in the spec
        (x) => (typeof x === 'number' || typeof x === 'bigint' ? '0x' + x.toString(16) : x),
        z
            .string()
            .regex(/^0x([1-9a-f]+[\da-f]*|0)$/g)
            .refine((val) => Number.parseInt(val.slice(2), 16) <= Number.MAX_SAFE_INTEGER),
    )

    export const decimal = z.number().min(0).max(36)
    export const filter = z
        .object({
            fromBlock: unpadded_hex.nullish(),
            toBlock: unpadded_hex.nullish(),
            address: address.or(address.array()).nullish(),
            topics: z.any().nullish(),
        })
        .partial()
        .strict()
        .describe('Filter')
    export const filter_identifier = unpadded_hex.describe('FilterIdentifier')
    export const hydrated_transactions = z.boolean().nullish().describe('HydratedTransactions')
    export const subscription_id = z.string()
    export const symbol = z.string().min(2).max(11)
    export const transaction = z
        .object({
            type: z
                .string()
                .regex(/^0x([\d,A-Fa-f]?){1,2}$/g)
                .nullish(),
            nonce: unpadded_hex.nullish(),
            to: address.nullish(),
            from: address.nullish(),
            gas: unpadded_hex.nullish(),
            value: unpadded_hex.nullish(),
            data: hexAllowCap.nullish(),
            input: hex.nullish(),
            gasPrice: unpadded_hex.nullish(),
            maxPriorityFeePerGas: unpadded_hex.nullish(),
            maxFeePerGas: unpadded_hex.nullish(),
            maxFeePerBlobGas: unpadded_hex.nullish(),
            accessList: z.object({ address, storageKeys: z.string().array() }).strict().array().nullish(),
            blobVersionedHashes: z.string().array().nullish(),
            blobs: z.string().array().nullish(),
            chainId,
        })
        .partial()
        .strict()
        .describe('Transaction')
    export const transaction_hash = z.string().regex(/^0x[\da-f]{64}$/g)
    export const transaction_index = unpadded_hex.describe('TransactionIndex')

    // only used in return
    export const account = z.any()
    export const block_object = z.any()
    export const EIP2255_PermissionList = z.array(
        z.object({
            parentCapability: z.string().optional(),
            id: z.string().optional(),
            invoker: z.string(),
            caveats: z.array(z.object({ type: z.string(), value: z.unknown(), name: z.string().optional() })),
        }),
    )
    export const fee_history_result = z.any()
    export const log_objects = z.any()
    export const receipts_information = z.any()
    export const syncing_status = z.any()
    export const transaction_count = unpadded_hex.nullish().describe('TransactionCount')
    export const transaction_information = z.any()
    export const uncle_count = unpadded_hex.nullish().describe('UncleCount')
}
// No error message interpolation support until https://github.com/colinhacks/zod/issues/3048
export const methodValidate = {
    eth_accounts: { args: z.tuple([]), return: _.address.array() },
    eth_blobBaseFee: { args: z.tuple([]), return: _.unpadded_hex },
    eth_blockNumber: { args: z.tuple([]), return: _.unpadded_hex },
    eth_call: { args: z.tuple([_.transaction, _.block.nullish()]), return: _.hex },
    eth_chainId: { args: z.tuple([]), return: _.chainId },
    eth_estimateGas: { args: z.tuple([_.transaction, _.block_number_or_tag.nullish()]), return: _.unpadded_hex },
    eth_feeHistory: {
        args: z.tuple([
            _.unpadded_hex.or(z.number().positive()).describe('blockCount'),
            _.block_number_or_tag.describe('newestBlock'),
            z.number().array().describe('rewardPercentiles'),
        ]),
        return: _.fee_history_result,
    },
    eth_gasPrice: { args: z.tuple([]), return: _.unpadded_hex },
    eth_getBalance: { args: z.tuple([_.address, _.block.nullish()]), return: _.unpadded_hex },
    eth_getBlockByHash: { args: z.tuple([_.block_hash, _.hydrated_transactions]), return: _.block_object },
    eth_getBlockByNumber: { args: z.tuple([_.block_number_or_tag, _.hydrated_transactions]), return: _.block_object },
    eth_getBlockReceipts: { args: z.tuple([_.block]), return: _.receipts_information },
    eth_getBlockTransactionCountByHash: { args: z.tuple([_.block_hash]), return: _.transaction_count },
    eth_getBlockTransactionCountByNumber: { args: z.tuple([_.block_number_or_tag]), return: _.transaction_count },
    eth_getCode: { args: z.tuple([_.address, _.block.nullish()]), return: _.hex },
    eth_getFilterChanges: { args: z.tuple([_.filter_identifier]), return: _.log_objects },
    eth_getFilterLogs: { args: z.tuple([_.filter_identifier]), return: _.log_objects },
    eth_getLogs: { args: z.tuple([_.filter]), return: _.log_objects },
    eth_getProof: {
        args: z.tuple([_.address, z.array(z.string()).describe('StorageKeys'), _.block]),
        return: _.account,
    },
    eth_getStorageAt: {
        args: z.tuple([
            _.address,
            z
                .string()
                .regex(/^0x([1-9a-f]+[\da-f]{0,31})|0$/g)
                .describe('StorageSlot'),
            _.block.nullish(),
        ]),
        return: _.hex,
    },
    eth_getTransactionByBlockHashAndIndex: {
        args: z.tuple([_.block_hash, _.transaction_index]),
        return: _.transaction_information,
    },
    eth_getTransactionByBlockNumberAndIndex: {
        args: z.tuple([_.block_number_or_tag, _.transaction_index]),
        return: _.transaction_information,
    },
    eth_getTransactionByHash: { args: z.tuple([_.transaction_hash]), return: _.transaction_information },
    eth_getTransactionCount: { args: z.tuple([_.address, _.block.nullish()]), return: _.unpadded_hex },
    eth_getTransactionReceipt: { args: z.tuple([_.transaction_hash]), return: _.receipts_information },
    eth_getUncleCountByBlockHash: { args: z.tuple([_.block_hash]), return: _.uncle_count },
    eth_getUncleCountByBlockNumber: { args: z.tuple([_.block_number_or_tag]), return: _.uncle_count },
    eth_maxPriorityFeePerGas: { args: z.tuple([]), return: _.unpadded_hex },
    eth_newBlockFilter: { args: z.tuple([]), return: _.filter_identifier },
    eth_newFilter: { args: z.tuple([_.filter]), return: _.filter_identifier },
    eth_newPendingTransactionFilter: { args: z.tuple([]), return: _.filter_identifier },
    eth_requestAccounts: { args: z.tuple([]), return: _.address.array() },
    eth_sendTransaction: {
        args: z.tuple([
            /* ! not same as _.transaction */ z
                .object({
                    to: _.address.nullish().optional(),
                    from: _.address,
                    gas: _.unpadded_hex.nullish().optional(),
                    value: _.unpadded_hex.nullish().optional(),
                    data: _.hex.nullish().optional(),
                    gasLimit: _.unpadded_hex.nullish().optional(),
                    gasPrice: _.unpadded_hex.nullish().optional(),
                    maxPriorityFeePerGas: _.unpadded_hex.nullish().optional(),
                    maxFeePerGas: _.unpadded_hex.nullish().optional(),
                    type: _.hex.nullish().optional(),
                })
                .strict()
                .describe('Transaction'),
        ]),
        return: _.transaction_hash,
    },
    eth_sendRawTransaction: { args: z.tuple([_.hex.describe('Transaction')]), return: _.transaction_hash },
    eth_signTypedData_v4: {
        args: z.tuple([
            _.address,
            z.preprocess(
                (arg) => (typeof arg === 'string' ? JSON.parse(arg) : arg),
                z
                    .object({
                        types: z
                            .object({ EIP712Domain: z.array(z.unknown()) })
                            .catchall(z.array(z.object({ type: z.string(), name: z.string() })))
                            .describe('types'),
                        domain: z.object({}).passthrough(),
                        primaryType: z.string(),
                        message: z.object({}).passthrough(),
                    })
                    .refine(
                        (val) => {
                            try {
                                getMessage(val as any)
                                return true
                            } catch {
                                return false
                            }
                        },
                        { message: 'Typed data does not match JSON schema' },
                    )
                    .describe('TypedData'),
            ),
        ]),
        return: _.hex,
    },
    eth_subscribe: {
        args: z.tuple([
            z.enum(['newHeads', 'logs', 'newPendingTransactions', 'syncing']).describe('subscriptionType'),
            z
                .object({ address: _.address.or(_.address.array()).nullish(), topics: z.string().array() })
                .strict()
                .nullish()
                .describe('filterOptions'),
        ]),
        return: _.subscription_id,
    },
    eth_syncing: { args: z.tuple([]), return: _.syncing_status },
    eth_uninstallFilter: { args: z.tuple([_.filter_identifier]), return: z.boolean() },
    eth_unsubscribe: { args: z.tuple([_.subscription_id]), return: z.boolean() },
    personal_ecRecover: { args: z.tuple([z.string(), _.hex]), return: _.hex },
    personal_sign: { args: z.tuple([_.hexAllowCap.describe('Challenge'), _.address]), return: _.hex },
    wallet_addEthereumChain: {
        args: z.tuple([
            z
                .object({
                    chainId: _.chainId,
                    blockExplorerUrls: z.array(_.httpsURL).nullish(),
                    chainName: z.string().nonempty().optional(),
                    iconUrls: z.array(_.httpsURL).nullish(),
                    nativeCurrency: z
                        .object({ decimals: _.decimal, name: z.string().nonempty(), symbol: _.symbol })
                        .strict()
                        .optional(),
                    // TODO: support websocket urls in the future
                    rpcUrls: z.array(_.httpsURL).nonempty(),
                })
                .strict()
                .describe('EIP3085_AddEthereumChainParameter'),
        ]),
        return: z.null(),
    },
    wallet_getPermissions: { args: z.tuple([]), return: _.EIP2255_PermissionList },
    wallet_requestPermissions: {
        args: z.tuple([z.object({}).passthrough().describe('requestPermissionsObject')]),
        return: z
            .object({ parentCapability: z.string(), date: z.number().nullish().optional() })
            .describe('PermissionRequest')
            .array(),
    },
    wallet_revokePermissions: {
        args: z.tuple([z.object({}).passthrough().describe('revokePermissionObject')]),
        return: z.null(),
    },
    wallet_switchEthereumChain: {
        args: z.tuple([z.object({ chainId: _.chainId }).strict().describe('SwitchEthereumChainParameter')]),
        return: z.null(),
    },
    wallet_watchAsset: {
        args: z.tuple([
            z.object({
                type: z.enum(['ERC20', 'ERC721', 'ERC1155']),
                options: z
                    .object({
                        address: _.address,
                        symbol: _.symbol.nullish(),
                        decimals: _.decimal.nullish(),
                        image: z.string().url().nullish(),
                        tokenId: z.string().nonempty().nullish(),
                    })
                    .strict()
                    .describe('options'),
            }),
        ]),
        return: z.boolean(),
    },
    net_version: { args: z.tuple([]), return: z.string() },
}

type returns = {
    [K in keyof typeof methodValidate]: z.infer<(typeof methodValidate)[K]['return']>
}

export type Methods = {
    [K in keyof typeof methodValidate]: (
        ...params: z.infer<(typeof methodValidate)[K]['args']>
    ) => Promise<returns[K] | Result<returns[K], any> | MaskEthereumProviderRpcError>
}
