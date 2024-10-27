import { useMemo } from 'react'
import { usePostInfoIdentifier, usePostInfoPostID } from './PostContext.js'
import { getPostURL } from './context.js'

export function usePostLink() {
    const id = usePostInfoPostID()
    const identifier = usePostInfoIdentifier()
    return useMemo(() => {
        if (!id || !identifier) return ''
        return getPostURL(identifier) ?? ''
    }, [id, identifier, getPostURL])
}
