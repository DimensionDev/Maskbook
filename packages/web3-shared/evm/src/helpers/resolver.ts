import {
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
} from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { CHAIN_DESCRIPTORS, NETWORK_DESCRIPTORS, PROVIDER_DESCRIPTORS } from '../constants/index.js'
import type { ChainId } from '../types/index.js'

export const chainResolver = createChainResolver(CHAIN_DESCRIPTORS)
export const explorerResolver = createExplorerResolver(CHAIN_DESCRIPTORS)
export const networkResolver = createNetworkResolver(NETWORK_DESCRIPTORS)
export const providerResolver = createProviderResolver(PROVIDER_DESCRIPTORS)

export function getAverageBlockDelay(chainId: ChainId, scale = 1) {
    const delay = NETWORK_DESCRIPTORS.find((x) => x.chainId === chainId)?.averageBlockDelay ?? 10
    return delay * scale * 1000
}

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    return new BigNumber(keccak256(toUtf8Bytes(domain.replace(/\.\w+$/, '')))).toFixed()
}
