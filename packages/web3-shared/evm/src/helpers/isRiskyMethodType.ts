import { EthereumMethodType } from '../types/index.js'

export const riskyMethodType = [
    EthereumMethodType.eth_sign,
    EthereumMethodType.personal_sign,
    EthereumMethodType.wallet_watchAsset,
    EthereumMethodType.wallet_requestPermissions,
    EthereumMethodType.wallet_addEthereumChain,
    EthereumMethodType.wallet_switchEthereumChain,
    EthereumMethodType.eth_signTypedData_v4,
    EthereumMethodType.eth_sendTransaction,
    EthereumMethodType.eth_signTransaction,
    EthereumMethodType.MASK_REPLACE_TRANSACTION,
] as const
Object.freeze(riskyMethodType)
