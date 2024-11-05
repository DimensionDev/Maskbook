import { isZeroAddress } from '@masknet/web3-shared-evm'
import { NATIVE_TOKEN_ADDRESS } from './constant.js'

export function toOkxNativeAddress(address: string) {
    if (isZeroAddress(address)) return NATIVE_TOKEN_ADDRESS
    return address
}

export function fromOkxNativeAddress(address: string) {
    if (address === NATIVE_TOKEN_ADDRESS) return '0x0000000000000000000000000000000000000000'
    return address
}

export function normalizeCode<T extends { code: number }>(res: T): T {
    return {
        ...res,
        code: +res.code,
    }
}

export function fixToken<T extends { decimals: number; decimal: string }>(res: T): T {
    return {
        ...res,
        decimals: +res.decimal,
    }
}
