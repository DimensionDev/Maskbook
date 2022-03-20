import { activatedSocialNetworkUI } from '../../social-network'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import type { ProfileIdentifier } from '@masknet/shared-base'

export { usePostInfo, PostInfoProvider, usePostInfoDetails } from '@masknet/plugin-infra'
export function usePostLink() {
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    if (!id || !identifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(identifier) ?? ''
}
export function usePostClaimedAuthor(): ProfileIdentifier | undefined {
    const payload = usePostInfoDetails.containingMaskPayload().unwrapOr(undefined)
    if (!payload) return undefined
    if (payload.version !== -38) return undefined
    return payload.authorUserID
}
