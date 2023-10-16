import { useMemo } from 'react'
import { usePostInfoDetails } from './PostContext.js'
import { getPostURL } from './context.js'

export function usePostLink() {
    const id = usePostInfoDetails.postID()
    const identifier = usePostInfoDetails.identifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return getPostURL?.(identifier) ?? ''
    }, [id, identifier, getPostURL])
}
