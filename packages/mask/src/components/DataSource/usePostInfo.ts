import { activatedSocialNetworkUI } from '../../social-network'
import { usePostInfoDetails } from '@masknet/plugin-infra'

export { usePostInfo, PostInfoProvider, usePostInfoDetails } from '@masknet/plugin-infra'
export function usePostLink() {
    const url = usePostInfoDetails.url()
    const identifier = usePostInfoDetails.identifier()
    if (url) return url.toString()
    if (!identifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(identifier) ?? ''
}
