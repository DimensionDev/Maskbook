import { activatedSocialNetworkUI } from '../../social-network'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'

export function usePostLink() {
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    if (!id || !identifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(identifier) ?? ''
}
