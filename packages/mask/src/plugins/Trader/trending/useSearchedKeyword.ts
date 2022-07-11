import { useEffect, useState } from 'react'
import { activatedSocialNetworkUI } from '../../../social-network'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        const onLocationChange = () => {
            if (!activatedSocialNetworkUI?.collecting?.getSearchedKeyword) return
            setKeyword(activatedSocialNetworkUI.collecting.getSearchedKeyword())
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [])
    return keyword
}
