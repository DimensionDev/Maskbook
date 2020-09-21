import BigNumber from 'bignumber.js'
import { getConstant } from './constants'
import { ChainId } from './types'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isETH(address: string) {
    return isSameAddress(address, getConstant('ETH_ADDRESS', ChainId.Mainnet))
}

export function isDAI(address: string) {
    return isSameAddress(address, getConstant('DAI_ADDRESS', ChainId.Mainnet))
}

export function isOKB(address: string) {
    return isSameAddress(address, getConstant('OBK_ADDRESS', ChainId.Mainnet))
}

export function isUSDT(address: string) {
    return isSameAddress(address, getConstant('USDK_ADDRESS', ChainId.Mainnet))
}

export function addGasMargin(value: BigNumber) {
    return value.multipliedBy(new BigNumber(10000).plus(new BigNumber(1000))).dividedToIntegerBy(new BigNumber(10000))
}
