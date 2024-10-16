import type { LensBaseAPI } from '@masknet/web3-providers/types'
import urlcat from 'urlcat'

export function getFireflyLensProfileLink(handle: string) {
    return urlcat('https://firefly.mask.social/profile/lens/:handle', { handle })
}

export function getProfileAvatar(profile: LensBaseAPI.Profile | undefined) {
    const picture = profile?.metadata?.picture
    if (!picture) return
    if ('optimized' in picture) return picture.optimized?.uri || picture.raw.uri
    return picture.image.optimized?.uri || picture.image.raw.uri
}
