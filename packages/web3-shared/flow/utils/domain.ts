import { isSameAddress } from '@masknet/web3-shared-base'
import { getTokenConstant, ZERO_ADDRESS } from '../constants'
import { ChainId } from '../types'

export function formatDomainName(domain?: string, size?: number) {
    return domain ?? ''
}

export function isValidDomain(domain: string) {
    return false
}

export function isZeroAddress(address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(chainId?: ChainId, address?: string) {
    return isSameAddress(address, getTokenConstant(chainId ?? ChainId.Mainnet, 'FLOW_ADDRESS'))
}
