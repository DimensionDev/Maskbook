import {
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
} from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { isENSContractAddress, isENSNameWrapperContractAddress } from './address.js'
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

const LENS_FOLLOWER_IMAGE = new URL('../assets/lens-follower.svg', import.meta.url).href
const LENS_COMMENT_IMAGE = new URL('../assets/lens-comment.svg', import.meta.url).href
const LENS_POST_IMAGE = new URL('../assets/lens-post.svg', import.meta.url).href
const LENS_COLLECT_IMAGE = new URL('../assets/lens-collect.svg', import.meta.url).href
const LENS_IMAGE = new URL('../assets/lens.svg', import.meta.url).href
const ENS_IMAGE = new URL('../assets/ens.svg', import.meta.url).href

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
    if (collectionName && isLensCollect(collectionName)) {
        return LENS_COLLECT_IMAGE
    }
    if (address && (isENSContractAddress(address) || isENSNameWrapperContractAddress(address))) return ENS_IMAGE
    return
}

export function isLens(name?: string) {
    if (!name) return false
    name = name.toLowerCase()
    return name.endsWith('.lens') || name === 'lensprotocol' || name === '@lensprotocol'
}

export function isLensFollower(name: string) {
    // vitalik.lens-Follower, lensprotocol-Follower V2
    return name.includes('.lens-Follower') || name.includes('lensprotocol-Follower') || name.endsWith("'s follower NFT")
}

const NORMAL_COLLECT_RE = /\.lens-Collect-\d+$/
const ADMIN_COLLECT_RE = /^lensprotocol-Collect-\d+$/
export function isLensCollect(name: string) {
    return NORMAL_COLLECT_RE.test(name) || ADMIN_COLLECT_RE.test(name)
}

const NORMAL_POST_RE = /^Post by @.*\.lens$/
const ADMIN_POST_RE = /^Post by @lensprotocol$/
const GENESIS_POST_RE = /Genesis post - \w+.lens/
// May be not `quoted` post but something else
const QUOTED_POST_RE = /^Post by @\w+$/
export function isLensPost(name: string) {
    return (
        NORMAL_POST_RE.test(name) || ADMIN_POST_RE.test(name) || GENESIS_POST_RE.test(name) || QUOTED_POST_RE.test(name)
    )
}

const NORMAL_COMMENT_RE = /^Comment by @.*\.lens$/
const ADMIN_COMMENT_RE = /^Comment by @lensprotocol$/
// May be not `quoted` comment but something else
const QUOTED_COMMENT_RE = /^Comment by @\w+$/
export function isLensComment(name: string) {
    return NORMAL_COMMENT_RE.test(name) || ADMIN_COMMENT_RE.test(name) || QUOTED_COMMENT_RE.test(name)
}
