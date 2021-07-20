import { getTokenConstants } from '../constants'

export function isSameAddress(addrA: string = '', addrB: string = '') {
    if (!addrA || !addrB) return false
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function currySameAddress(base?: string) {
    return (target: string | { address: string }) => {
        if (!base) return false
        if (typeof target === 'string') {
            return isSameAddress(base, target)
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return isSameAddress(base, target.address)
        }
        throw new Error('Unsupported `target` address format')
    }
}

export const isDAI = currySameAddress(getTokenConstants().DAI_ADDRESS)

export const isOKB = currySameAddress(getTokenConstants().OKB_ADDRESS)

export const isNative = currySameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS)
