import { MaskEthereumProviderRpcError, fromMessage, ErrorCode } from '@masknet/sdk'
import z, { type ZodError } from 'zod'

export const requestSchema = z.object({
    method: z.string().nonempty(),
    params: z.object({}).or(z.array(z.unknown())).nullish().optional(),
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
    export const chainId = z
        .string()
        .regex(/^0x([1-9a-f]+[\da-f]*|0)$/g)
        .refine((val) => Number.parseInt(val.slice(2), 16) <= Number.MAX_SAFE_INTEGER)
    export const decimal = z.number().min(0).max(36)
    export const filter = z
        .object({
            fromBlock: unpadded_hex.nullish().nullable(),
            toBlock: unpadded_hex.nullish().nullable(),
            address: address.or(address.array()).nullable(),
            topics: z.any().nullable(),
        })
        .partial()
        .strict()
        .describe('Filter')
    export const filter_identifier = unpadded_hex.describe('FilterIdentifier')
    export const hydrated_transactions = z.boolean().nullable().describe('HydratedTransactions')
    export const subscription_id = z.string()
    export const symbol = z.string().min(2).max(11)
    export const transaction = z
        .object({
            type: z
                .string()
                .regex(/^0x([\d,A-Fa-f]?){1,2}$/g)
                .nullable(),
            nonce: unpadded_hex.nullable(),
            to: address.nullable(),
            from: address.nullable(),
            gas: unpadded_hex.nullable(),
            value: unpadded_hex.nullable(),
            data: hexAllowCap.nullable(),
            input: hex.nullable(),
            gasPrice: unpadded_hex.nullable(),
            maxPriorityFeePerGas: unpadded_hex.nullable(),
            maxFeePerGas: unpadded_hex.nullable(),
            maxFeePerBlobGas: unpadded_hex.nullable(),
            accessList: z
                .object({
                    address,
                    storageKeys: z.string().array(),
                })
                .strict()
                .array()
                .nullable(),
            blobVersionedHashes: z.string().array().nullable(),
            blobs: z.string().array().nullable(),
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
            id: z.string().optional(),
            invoker: z.string(),
            caveats: z.array(
                z.object({
                    type: z.string(),
                    value: z.unknown(),
                    name: z.string().optional(),
                }),
            ),
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
export const ParamsValidate = {
    eth_subscribe: z.tuple([
        z.enum(['newHeads', 'logs', 'newPendingTransactions', 'syncing']).describe('subscriptionType'),
        z
            .object({
                address: _.address.or(_.address.array()).nullish(),
                topics: z.string().array(),
            })
            .strict()
            .nullish()
            .describe('filterOptions'),
    ]),
    eth_unsubscribe: z.tuple([_.subscription_id]),
    wallet_addEthereumChain: z.tuple([
        z
            .object({
                chainId: _.chainId,
                blockExplorerUrls: z.array(_.httpsURL).nullish(),
                chainName: z.string().nonempty().optional(),
                iconUrls: z.array(_.httpsURL).nullish(),
                nativeCurrency: z
                    .object({
                        decimals: _.decimal,
                        name: z.string().nonempty(),
                        symbol: _.symbol,
                    })
                    .strict()
                    .optional(),
                rpcUrls: z.array(_.httpsURL).nonempty().nullish(),
            })
            .strict()
            .describe('EIP3085_AddEthereumChainParameter'),
    ]),
    wallet_switchEthereumChain: z.tuple([
        z.object({ chainId: _.chainId }).strict().describe('SwitchEthereumChainParameter'),
    ]),
    wallet_requestPermissions: z.tuple([z.object({}).describe('requestPermissionsObject')]),
    wallet_revokePermissions: z.tuple([z.object({}).describe('revokePermissionObject')]),
    wallet_getPermissions: z.tuple([]),
    wallet_watchAsset: z.tuple([
        z.enum(['ERC20', 'ERC721', 'ERC1155']).describe('type'),
        z
            .object({
                address: _.address,
                symbol: _.symbol.nullish(),
                decimals: _.decimal.nullish(),
                image: z.string().url().nullish(),
                tokenId: z.string().nonempty().nullish(),
            })
            .strict()
            .describe('options'),
    ]),
    eth_decrypt: z.tuple([z.string().describe('EncryptedMessage'), _.address]),
    eth_getEncryptionPublicKey: z.tuple([_.address]),
    eth_requestAccounts: z.tuple([]),
    eth_accounts: z.tuple([]),
    eth_signTypedData_v4: z.tuple([
        _.address,
        z
            .object({
                types: z
                    .object({
                        EIP712Domain: z.array(z.unknown()),
                    })
                    .describe('types'),
                domain: z.object({}),
                primaryType: z.string(),
                message: z.object({}),
            })
            .describe('TypedData'),
    ]),
    personal_sign: z.tuple([_.hexAllowCap.describe('Challenge'), _.address]),
    eth_sendTransaction: z.tuple([
        // ! not same as _.transaction
        z
            .object({
                to: _.address.nullish(),
                from: _.address,
                gas: _.unpadded_hex.nullish(),
                value: _.unpadded_hex.nullish(),
                data: _.hex.nullish(),
                gasPrice: _.unpadded_hex.nullish(),
                maxPriorityFeePerGas: _.unpadded_hex.nullish(),
                maxFeePerGas: _.unpadded_hex.nullish(),
            })
            .strict()
            .describe('Transaction'),
    ]),
    web3_clientVersion: z.tuple([]),
    eth_blockNumber: z.tuple([]),
    eth_call: z.tuple([_.transaction, _.block.nullish()]),
    eth_chainId: z.tuple([]),
    eth_coinbase: z.tuple([]),
    eth_estimateGas: z.tuple([_.transaction, _.block_number_or_tag.nullish()]),
    eth_feeHistory: z.tuple([
        _.unpadded_hex.or(z.number().positive()).describe('blockCount'),
        _.block_number_or_tag.describe('newestBlock'),
        z.number().array().describe('rewardPercentiles'),
    ]),
    eth_gasPrice: z.tuple([]),
    eth_getBalance: z.tuple([_.address, _.block.nullish()]),
    eth_getBlockByHash: z.tuple([_.block_hash, _.hydrated_transactions]),
    eth_getBlockByNumber: z.tuple([_.block_number_or_tag, _.hydrated_transactions]),
    eth_getBlockReceipts: z.tuple([_.block]),
    eth_getBlockTransactionCountByHash: z.tuple([_.block_hash]),
    eth_getBlockTransactionCountByNumber: z.tuple([_.block_number_or_tag]),
    eth_getCode: z.tuple([_.address, _.block.nullish()]),
    eth_getFilterChanges: z.tuple([_.filter_identifier]),
    eth_getFilterLogs: z.tuple([_.filter_identifier]),
    eth_getLogs: z.tuple([_.filter]),
    eth_getProof: z.tuple([_.address, z.array(z.string()).describe('StorageKeys'), _.block]),
    eth_getStorageAt: z.tuple([
        _.address,
        z
            .string()
            .regex(/^0x([1-9a-f]+[\da-f]{0,31})|0$/g)
            .describe('StorageSlot'),
        _.block.nullish(),
    ]),
    eth_getTransactionByBlockHashAndIndex: z.tuple([_.block_hash, _.transaction_index]),
    eth_getTransactionByBlockNumberAndIndex: z.tuple([_.block_number_or_tag, _.transaction_index]),
    eth_getTransactionByHash: z.tuple([_.transaction_hash]),
    eth_getTransactionCount: z.tuple([_.address, _.block.nullish()]),
    eth_getTransactionReceipt: z.tuple([_.transaction_hash]),
    eth_getUncleCountByBlockHash: z.tuple([_.block_hash]),
    eth_getUncleCountByBlockNumber: z.tuple([_.block_number_or_tag]),
    eth_maxPriorityFeePerGas: z.tuple([]),
    eth_newBlockFilter: z.tuple([]),
    eth_newFilter: z.tuple([_.filter]),
    eth_newPendingTransactionFilter: z.tuple([]),
    eth_sendRawTransaction: z.tuple([_.hex.describe('Transaction')]),
    eth_syncing: z.tuple([]),
    eth_uninstallFilter: z.tuple([_.filter_identifier]),
}
export const ReturnValidate = {
    eth_subscribe: _.subscription_id,
    eth_unsubscribe: z.boolean(),
    wallet_addEthereumChain: z.null(),
    wallet_switchEthereumChain: z.null(),
    wallet_requestPermissions: _.EIP2255_PermissionList,
    wallet_revokePermissions: z.null(),
    wallet_getPermissions: _.EIP2255_PermissionList,
    wallet_watchAsset: z.boolean(),
    // deprecated
    eth_decrypt: z.never(),
    // deprecated
    eth_getEncryptionPublicKey: z.never(),
    eth_requestAccounts: _.address.array(),
    eth_accounts: _.address.array(),
    eth_signTypedData_v4: _.hex,
    personal_sign: _.hex,
    eth_sendTransaction: _.transaction_hash,
    web3_clientVersion: z.string(),
    eth_blockNumber: _.unpadded_hex,
    eth_call: _.hex,
    eth_chainId: _.chainId,
    eth_coinbase: _.address,
    eth_estimateGas: _.unpadded_hex,
    eth_feeHistory: _.fee_history_result,
    eth_gasPrice: _.unpadded_hex,
    eth_getBalance: _.unpadded_hex,
    eth_getBlockByHash: _.block_object,
    eth_getBlockByNumber: _.block_object,
    eth_getBlockReceipts: _.receipts_information,
    eth_getBlockTransactionCountByHash: _.transaction_count,
    eth_getBlockTransactionCountByNumber: _.transaction_count,
    eth_getCode: _.hex,
    eth_getFilterChanges: _.log_objects,
    eth_getFilterLogs: _.log_objects,
    eth_getLogs: _.log_objects,
    eth_getProof: _.account,
    eth_getStorageAt: _.hex,
    eth_getTransactionByBlockHashAndIndex: _.transaction_information,
    eth_getTransactionByBlockNumberAndIndex: _.transaction_information,
    eth_getTransactionByHash: _.transaction_information,
    eth_getTransactionCount: _.unpadded_hex,
    eth_getTransactionReceipt: _.receipts_information,
    eth_getUncleCountByBlockHash: _.uncle_count,
    eth_getUncleCountByBlockNumber: _.uncle_count,
    eth_maxPriorityFeePerGas: _.unpadded_hex,
    eth_newBlockFilter: _.filter_identifier,
    eth_newFilter: _.filter_identifier,
    eth_newPendingTransactionFilter: _.filter_identifier,
    eth_sendRawTransaction: _.transaction_hash,
    eth_syncing: _.syncing_status,
    eth_uninstallFilter: z.boolean(),
}
