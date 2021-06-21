import { TOKEN_CONSTANTS } from '../constants'
import { ChainId } from '../types'
import { constantOfChain } from './constant'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function currySameAddress(base: string) {
    return (target: string | { address: string }) => {
        if (typeof target === 'string') {
            return isSameAddress(base, target)
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return isSameAddress(base, target.address)
        }
        throw new Error('Unsupported `target` address format')
    }
}

export const isDAI = currySameAddress(constantOfChain(TOKEN_CONSTANTS, ChainId.Mainnet).DAI_ADDRESS)

export const isOKB = currySameAddress(constantOfChain(TOKEN_CONSTANTS, ChainId.Mainnet).OKB_ADDRESS)

export const isNative = currySameAddress(constantOfChain(TOKEN_CONSTANTS, ChainId.Mainnet).NATIVE_TOKEN_ADDRESS)
