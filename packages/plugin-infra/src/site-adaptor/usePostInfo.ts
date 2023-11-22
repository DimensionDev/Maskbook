import { useMemo } from 'react'
import { usePostInfoDetails } from './PostContext.js'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

export function usePostLink() {
    const context = useSiteAdaptorContext()
    const id = usePostInfoDetails.postID()
    const identifier = usePostInfoDetails.identifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return context?.getPostURL?.(identifier) ?? ''
    }, [id, identifier, context?.getPostURL])
}
