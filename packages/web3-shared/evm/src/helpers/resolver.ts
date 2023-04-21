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

const LENS_FOLLOWER_IMAGE = new URL('./lens-follower.svg', import.meta.url).href
const LENS_COMMENT_IMAGE = new URL('./lens-comment.svg', import.meta.url).href
const LENS_POST_IMAGE = new URL('./lens-post.svg', import.meta.url).href
const LENS_COLLECT_IMAGE = new URL('./lens-collect.svg', import.meta.url).href
const LENS_IMAGE = new URL('./lens.svg', import.meta.url).href
const ENS_IMAGE = new URL('./ens.svg', import.meta.url).href

export function resolveImageURL(image?: string, name?: string, collectionName?: string, address?: string) {
    if (image) return image
    if (name) {
        if (isLensFollower(name)) return LENS_FOLLOWER_IMAGE
        if (isLensComment(name)) return LENS_COMMENT_IMAGE
        if (isLensPost(name)) return LENS_POST_IMAGE
        // Check collect after comment and post
        if (isLensCollect(name)) return LENS_COLLECT_IMAGE
        if (isLens(name)) return LENS_IMAGE
    }
    if (collectionName && isLensCollect(collectionName)) return LENS_COLLECT_IMAGE
    if (address && isENSContractAddress(address)) return ENS_IMAGE
    return
}

export function isLens(name?: string) {
    if (!name) return false
    return name.toLowerCase().endsWith('.lens') || name.toLowerCase() === 'lensprotocol'
}

export function isLensFollower(name: string) {
    // vitalik.lens-Follower, lensprotocol-Follower V2
    return name.includes('.lens-Follower') || name.includes('lensprotocol-Follower')
}

export function isLensCollect(name: string) {
    return /\.lens-Collect-\d+$/.test(name) || /^lensprotocol-Collect-\d+$/.test(name)
}

export function isLensPost(name: string) {
    return /^Post by @.*\.lens$/.test(name) || /^Post by @lensprotocol$/.test(name)
}

export function isLensComment(name: string) {
    return /^Comment by @.*\.lens$/.test(name) || /^Comment by @lensprotocol$/.test(name)
}
