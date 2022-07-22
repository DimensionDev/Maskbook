import { isSameAddress } from '@masknet/web3-shared-base'
import { getTokenConstants, ZERO_ADDRESS } from '../constants'
import type { ChainId } from '../types'

export function formatDomainName(domain?: string, size?: number) {
    return domain ?? ''
}

export function isValidDomain(domain: string) {
    return false
}

export function isZeroAddress(chainId?: ChainId, address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(chainId?: ChainId, address?: string) {
    return isSameAddress(address, getTokenConstants(chainId).FLOW_ADDRESS)
}
