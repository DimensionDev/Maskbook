import { NextIDPlatform, type BindingProof } from './types.js'

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
