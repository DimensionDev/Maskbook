import { useMemo } from 'react'
import { usePostInfoDetails } from './PostContext.js'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'

export function usePostLink() {
    const { getPostURL } = useSNSAdaptorContext()
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return getPostURL?.(identifier) ?? ''
    }, [id, identifier, getPostURL])
}
