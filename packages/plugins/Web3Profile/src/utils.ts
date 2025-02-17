import type { Web3BioProfile } from '@masknet/shared-base'
import type { FireflyConfigAPI, LensBaseAPI, NextIDBaseAPI } from '@masknet/web3-providers/types'
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

export const NextIdLensToFireflyLens = (account: NextIDBaseAPI.LensAccount): FireflyConfigAPI.LensAccount => {
    return {
        address: account.address,
        name: account.displayName,
        handle: account.handle,
        bio: '',
        url: '',
        profileUri: [],
    }
}

export function Web3BioProfileToFireflyLens(profile: Web3BioProfile) {
    return {
        address: profile.address,
        name: profile.displayName,
        handle: profile.identity,
        bio: profile.description,
        url: '',
        profileUri: [],
    }
}
