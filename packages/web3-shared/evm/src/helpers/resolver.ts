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
import { isENSContractAddress } from './address.js'

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

export function resolveImageURL(image?: string, name?: string, address?: string) {
    if (name) {
        if (isLensFollower(name)) return new URL('./lens-follower.svg', import.meta.url).href
        if (isLensCollect(name)) return new URL('./lens-collect.svg', import.meta.url).href
        if (isLensComment(name)) return new URL('./lens-comment.svg', import.meta.url).href
        if (isLensPost(name)) return new URL('./lens-post.svg', import.meta.url).href
        if (isLens(name)) return new URL('./lens.svg', import.meta.url).href
    }
    if (isENSContractAddress(address || '')) return new URL('./ens.svg', import.meta.url).toString()
    return image
}

/**
 * @param {string} name - Lens metadata name
 */
export function isLens(name?: string) {
    if (!name) return false
    return name.toLowerCase().endsWith('.lens') || name.toLowerCase() === 'lensprotocol'
}

export function isLensFollower(name: string) {
    // vitalik.lens-Follower, lensprotocol-Follower V2
    return name.endsWith('.lens-Follower') || name.startsWith('lensprotocol-Follower')
}

export function isLensCollect(name: string) {
    return /\.lens-Collect-\d+$/.test(name) || /^lensprotocol-Collect-\d+$/.test(name)
}

export function isLensPost(name: string) {
    return /\.lens-Post-\d+$/.test(name) || /^lensprotocol-Post-\d+$/.test(name)
}

export function isLensComment(name: string) {
    return /\.lens-Comment-\d+$/.test(name) || /^lensprotocol-Comment-\d+$/.test(name)
}
