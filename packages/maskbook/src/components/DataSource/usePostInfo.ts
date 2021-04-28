import { activatedSocialNetworkUI } from '../../social-network'
import { usePostInfoDetails } from '@dimensiondev/mask-plugin-infra'
import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export {
    usePostInfo,
    PostInfoProvider,
    usePostInfoDetails,
    usePostInfoSharedPublic,
} from '@dimensiondev/mask-plugin-infra'
export function usePostLink() {
    const postID = usePostInfoDetails('postID')
    const postIdentifier = usePostInfoDetails('postIdentifier')
    if (!postID || !postIdentifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier) ?? ''
}
export function usePostClaimedAuthor(): ProfileIdentifier | undefined {
    const info = usePostInfoDetails('postPayload')
    if (info.err) return undefined
    const payload = info.val
    if (payload.version !== -38) return undefined
    return payload.authorUserID
}
