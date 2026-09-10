import type { Web3BioProfile } from '@masknet/shared-base'
import urlcat from 'urlcat'

export function getFireflyLensProfileLink(handle: string) {
    return urlcat('https://firefly.social/profile/lens/:handle', { handle: handle.replace(/\.lens$/u, '') })
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
