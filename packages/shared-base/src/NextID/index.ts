import { NextIDPlatform, ProfileIdentifier } from '../index.js'
import { EnhanceableSite } from '../Site/type.js'
import { createLookupTableResolver } from '../utils/index.js'

export const resolveNextIDPlatformToNetwork = createLookupTableResolver<NextIDPlatform, EnhanceableSite | undefined>(
    {
        [NextIDPlatform.Ethereum]: undefined,
        [NextIDPlatform.GitHub]: undefined,
        [NextIDPlatform.Keybase]: undefined,
        [NextIDPlatform.Twitter]: EnhanceableSite.Twitter,
    } as Record<NextIDPlatform, EnhanceableSite | undefined>,
    undefined,
)

export const resolveNetworkToNextIDPlatform = createLookupTableResolver<EnhanceableSite, NextIDPlatform | undefined>(
    {
        [EnhanceableSite.Facebook]: undefined,
        [EnhanceableSite.Instagram]: undefined,
        [EnhanceableSite.Minds]: undefined,
        [EnhanceableSite.OpenSea]: undefined,
        [EnhanceableSite.Localhost]: undefined,
        [EnhanceableSite.Twitter]: NextIDPlatform.Twitter,
    },
    undefined,
)

export function resolveNextIDIdentityToProfile(nextIDIdentity: string, platform: NextIDPlatform) {
    const network = resolveNextIDPlatformToNetwork(platform)
    if (!network) return

    return ProfileIdentifier.of(network, nextIDIdentity).unwrap()
}
