import { EthereumMethodType } from '../types/index.js'

export function isRiskyMethodType(type: EthereumMethodType) {
    return [
        EthereumMethodType.eth_sign,
        EthereumMethodType.personal_sign,
        EthereumMethodType.wallet_watchAsset,
        EthereumMethodType.wallet_requestPermissions,
        EthereumMethodType.eth_signTypedData_v4,
        EthereumMethodType.eth_sendTransaction,
        EthereumMethodType.eth_signTransaction,
        EthereumMethodType.MASK_REPLACE_TRANSACTION,
    ].includes(type as EthereumMethodType)
}
