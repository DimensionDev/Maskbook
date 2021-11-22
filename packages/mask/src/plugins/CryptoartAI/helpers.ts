import BigNumber from 'bignumber.js'
import { pow10 } from '@masknet/web3-shared-evm'
import type { CryptoartAIToken } from './types'

export function toTokenIdentifier(token?: CryptoartAIToken) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}

export function toDecimalAmount(weiAmount: string, decimals: number) {
    return new BigNumber(weiAmount).dividedBy(pow10(decimals)).toNumber()
}

export function toUnixTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000)
}

export function toDate(timestamp: number) {
    if (timestamp === 0) return null
    return new Date(timestamp * 1000)
}
