import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { activatedSocialNetworkUI } from '../../social-network/index.js'

export function usePostLink() {
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    if (!id || !identifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(identifier) ?? ''
}
