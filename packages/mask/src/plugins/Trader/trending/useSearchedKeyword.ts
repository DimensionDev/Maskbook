import { useCallback, useEffect, useState } from 'react'
import { activatedSocialNetworkUI } from '../../../social-network'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')

    const onLocationChange = useCallback(() => {
        if (activatedSocialNetworkUI?.collecting?.getSearchedKeyword) {
            setKeyword(activatedSocialNetworkUI?.collecting?.getSearchedKeyword())
        }
    }, [])

    useEffect(() => {
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [onLocationChange])
    return keyword
}
