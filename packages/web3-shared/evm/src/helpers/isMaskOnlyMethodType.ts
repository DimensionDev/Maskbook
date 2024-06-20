import { type EthereumMethodType } from '../types/index.js'

export function isMaskOnlyMethodType(type: EthereumMethodType) {
    return type.startsWith('MASK_') || type.startsWith('mask_')
}
