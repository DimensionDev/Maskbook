import { useMemo } from 'react'
import { usePostInfoDetails } from '../contexts/PostContext.js'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.js'

export function usePostLink() {
    const { getPostURL } = useSNSAdaptorContext()
    const id = usePostInfoDetails.snsID()
    const identifier = usePostInfoDetails.identifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return getPostURL?.(identifier) ?? ''
    }, [id, identifier, getPostURL])
}
