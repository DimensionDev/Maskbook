import { EthereumMethodType } from '../types/index.js'

export function isRiskyMethodType(type: EthereumMethodType) {
    return [
        EthereumMethodType.ETH_SIGN,
        EthereumMethodType.PERSONAL_SIGN,
        EthereumMethodType.WATCH_ASSET,
        EthereumMethodType.ETH_SIGN_TYPED_DATA_OLD_V1,
        EthereumMethodType.ETH_SIGN_TYPED_DATA_OLD_V3,
        EthereumMethodType.ETH_SIGN_TYPED_DATA,
        EthereumMethodType.ETH_DECRYPT,
        EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
        EthereumMethodType.ETH_SEND_TRANSACTION,
        EthereumMethodType.ETH_SIGN_TRANSACTION,
        EthereumMethodType.MASK_REPLACE_TRANSACTION,
    ].includes(type as EthereumMethodType)
}
