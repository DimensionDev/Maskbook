import { ProfileIdentifier } from '@masknet/base'
import { EnhanceableSite } from '../Site/types.js'
import { NextIDPlatform, type BindingProof } from './types.js'

const NextIDPlatformToNetwork = {
    [NextIDPlatform.Ethereum]: undefined,
    [NextIDPlatform.GitHub]: undefined,
    [NextIDPlatform.Keybase]: undefined,
    [NextIDPlatform.Twitter]: EnhanceableSite.Twitter,
} as Record<NextIDPlatform, EnhanceableSite | undefined>
export function resolveNextIDPlatformToNetwork(key: NextIDPlatform): EnhanceableSite | undefined {
    return NextIDPlatformToNetwork[key]
}

const NetworkToNextIDPlatform = {
    [EnhanceableSite.Facebook]: undefined,
    [EnhanceableSite.Instagram]: undefined,
    [EnhanceableSite.Minds]: undefined,
    [EnhanceableSite.OpenSea]: undefined,
    [EnhanceableSite.Localhost]: undefined,
    [EnhanceableSite.Mirror]: undefined,
    [EnhanceableSite.Firefly]: undefined,
    [EnhanceableSite.Twitter]: NextIDPlatform.Twitter,
}
export function resolveNetworkToNextIDPlatform(key: EnhanceableSite): NextIDPlatform | undefined {
    return NetworkToNextIDPlatform[key]
}

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
    uid?: string,
): BindingProof {
    return {
        platform,
        source,
        uid,
        identity: platform === NextIDPlatform.Farcaster ? uid || identity : identity,
        name,
        created_at: '',
        last_checked_at: '',
        is_valid: true,
        relatedList,
        link,
    }
}
