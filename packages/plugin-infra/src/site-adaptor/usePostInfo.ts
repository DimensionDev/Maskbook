import { useMemo } from 'react'
import { usePostInfoDetails } from './PostContext.js'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

export function usePostLink() {
    const { getPostURL } = useSiteAdaptorContext()
    const id = usePostInfoDetails.postID()
    const identifier = usePostInfoDetails.identifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return getPostURL?.(identifier) ?? ''
    }, [id, identifier, getPostURL])
}
