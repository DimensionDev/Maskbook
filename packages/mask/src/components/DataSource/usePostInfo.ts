import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { activatedSiteAdaptorUI } from '../../social-network/index.js'

export function usePostLink() {
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    if (!id || !identifier) return ''
    return activatedSiteAdaptorUI.utils.getPostURL?.(identifier) ?? ''
}
