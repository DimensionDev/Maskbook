import type { Web3BioProfile } from '@masknet/shared-base'
import type { FireflyConfigAPI, NextIDBaseAPI } from '@masknet/web3-providers/types'
import urlcat from 'urlcat'

export function getFireflyLensProfileLink(handle: string) {
    return urlcat('https://firefly.social/profile/lens/:handle', { handle })
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
