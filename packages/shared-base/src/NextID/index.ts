import { ProfileIdentifier } from '@masknet/base'
import { EnhanceableSite } from '../Site/index.js'
import { NextIDPlatform, type BindingProof } from '../NextID/type.js'
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
        [EnhanceableSite.Mirror]: undefined,
        [EnhanceableSite.Twitter]: NextIDPlatform.Twitter,
    },
    undefined,
)

export function resolveNextIDIdentityToProfile(nextIDIdentity: string, platform: NextIDPlatform) {
    const network = resolveNextIDPlatformToNetwork(platform)
    if (!network) return

    return ProfileIdentifier.of(network, nextIDIdentity).expect(
        `${network} and ${nextIDIdentity} should compose a valid ProfileIdentifier`,
    )
}

export function createBindingProofFromProfileQuery(
    platform: NextIDPlatform,
    identity: string,
    name: string,
    link?: string,
    source?: NextIDPlatform,
    relatedList?: BindingProof[],
): BindingProof {
    return {
        platform,
        source,
        identity,
        name,
        created_at: '',
        last_checked_at: '',
        is_valid: true,
        relatedList,
        link,
    }
}
