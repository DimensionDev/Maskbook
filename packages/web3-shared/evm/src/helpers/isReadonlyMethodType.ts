import { EthereumMethodType } from '../types/index.js'

export const readonlyMethodType = [
    EthereumMethodType.net_version,
    EthereumMethodType.eth_blockNumber,
    EthereumMethodType.eth_blobBaseFee,
    EthereumMethodType.eth_call,
    EthereumMethodType.eth_estimateGas,
    EthereumMethodType.eth_feeHistory,
    EthereumMethodType.eth_gasPrice,
    EthereumMethodType.eth_getBalance,
    EthereumMethodType.eth_getBlockByHash,
    EthereumMethodType.eth_getBlockByNumber,
    EthereumMethodType.eth_getBlockReceipts,
    EthereumMethodType.eth_getBlockTransactionCountByHash,
    EthereumMethodType.eth_getBlockTransactionCountByNumber,
    EthereumMethodType.eth_getCode,
    EthereumMethodType.eth_getFilterChanges,
    EthereumMethodType.eth_getLogs,
    EthereumMethodType.eth_getProof,
    EthereumMethodType.eth_getStorageAt,
    EthereumMethodType.eth_getTransactionByBlockHashAndIndex,
    EthereumMethodType.eth_getTransactionByBlockNumberAndIndex,
    EthereumMethodType.eth_getTransactionByHash,
    EthereumMethodType.eth_getTransactionCount,
    EthereumMethodType.eth_getTransactionReceipt,
    EthereumMethodType.eth_getUncleCountByBlockHash,
    EthereumMethodType.eth_getUncleCountByBlockNumber,
    EthereumMethodType.eth_newPendingTransactionFilter,
    EthereumMethodType.eth_syncing,
] as const
Object.freeze(readonlyMethodType)
export function isReadonlyMethodType(type: EthereumMethodType) {
    return (readonlyMethodType as readonly EthereumMethodType[]).includes(type)
}
