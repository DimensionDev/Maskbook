import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useSocialNetwork } from './useContext.js'

export function usePostLink() {
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    const socialNetwork = useSocialNetwork()
    if (!id || !identifier) return ''
    return socialNetwork.utils.getPostURL?.(identifier) ?? ''
}
