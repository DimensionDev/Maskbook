import { useCallback, useEffect, useState } from 'react'
import { getActivatedUI } from '../../../social-network/ui'

/**
 * Listing all possible pathnames start from /search that the search box will keep existing on twitter.
 * That means the keyword will not be cleaned and related components keep injecting.
 * Otherwise, if a pathname not in this list the keyword will be cleaned and remove relative components from DOM.
 */
const SAFE_PATHNAMES_ON_TWITTER = [
    '/compose/tweet',
    '/search-advanced',
    '/settings/trends',
    '/settings/search',
    '/i/display',
    '/account/switch',
    '/i/keyboard_shortcuts',
]

export function useSearchedKeyword() {
    const internalName = getActivatedUI()?.internalName
    const [keyword, setKeyword] = useState('')

    const onLocationChange = useCallback(() => {
        if (internalName !== 'twitter') return
        const params = new URLSearchParams(location.search)
        if (location.pathname === '/search' && !params.get('f')) setKeyword(decodeURIComponent(params.get('q') ?? ''))
        else if (!SAFE_PATHNAMES_ON_TWITTER.includes(location.pathname)) setKeyword('')
    }, [])

    useEffect(() => {
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [onLocationChange])
    return keyword
}
