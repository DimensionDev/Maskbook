import { EthereumMethodType } from '../types/index.js'

export function isReadonlyMethodType(type: EthereumMethodType) {
    return [
        EthereumMethodType.ETH_GET_CODE,
        EthereumMethodType.ETH_GAS_PRICE,
        EthereumMethodType.ETH_BLOCK_NUMBER,
        EthereumMethodType.ETH_GET_BALANCE,
        EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER,
        EthereumMethodType.ETH_GET_BLOCK_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        EthereumMethodType.ETH_GET_FILTER_CHANGES,
        EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
        EthereumMethodType.ETH_ESTIMATE_GAS,
        EthereumMethodType.ETH_CALL,
        EthereumMethodType.ETH_GET_LOGS,
    ].includes(type)
}
