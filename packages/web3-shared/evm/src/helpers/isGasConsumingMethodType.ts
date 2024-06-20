import { EthereumMethodType } from '../types/index.js'

export const gasConsumingMethodType = [
    EthereumMethodType.eth_sendTransaction,
    EthereumMethodType.eth_signTransaction,
    EthereumMethodType.MASK_REPLACE_TRANSACTION,
] as const
Object.freeze(gasConsumingMethodType)
