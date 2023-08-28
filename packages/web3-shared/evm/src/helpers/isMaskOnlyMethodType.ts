import { EthereumMethodType } from '../types/index.js'

export function isMaskOnlyMethodType(type: EthereumMethodType) {
    return [
        EthereumMethodType.MASK_DEPLOY,
        EthereumMethodType.MASK_FUND,
        EthereumMethodType.MASK_LOGIN,
        EthereumMethodType.MASK_LOGOUT,
        EthereumMethodType.MASK_WALLETS,
        EthereumMethodType.MASK_ADD_WALLET,
        EthereumMethodType.MASK_UPDATE_WALLET,
        EthereumMethodType.MASK_RENAME_WALLET,
        EthereumMethodType.MASK_REMOVE_WALLET,
        EthereumMethodType.MASK_UPDATE_WALLETS,
        EthereumMethodType.MASK_REMOVE_WALLETS,
        EthereumMethodType.MASK_RESET_ALL_WALLETS,
        EthereumMethodType.MASK_REPLACE_TRANSACTION,
    ].includes(type)
}
