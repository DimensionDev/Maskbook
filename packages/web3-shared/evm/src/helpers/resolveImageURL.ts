import { isLens } from './isLens.js'
import { isLensFollower } from './isLensFollower.js'
import { isLensPost } from './isLensPost.js'
import { isLensComment } from './isLensComment.js'
import { isLensCollect } from './isLensCollect.js'
import { isENSContractAddress, isENSNameWrapperContractAddress } from './address.js'

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
