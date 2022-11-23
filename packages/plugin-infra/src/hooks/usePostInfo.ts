import { usePostInfoDetails, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

export function usePostLink() {
    const { getPostURL } = useSNSAdaptorContext()
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    if (!id || !identifier) return ''
    return getPostURL?.(identifier) ?? ''
}
