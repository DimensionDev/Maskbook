import { useEffect, useState } from 'react'
import { activatedSocialNetworkUI } from '../../social-network/index.js'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        const onLocationChange = () => {
            if (!activatedSocialNetworkUI.collecting.getSearchedKeyword) return
            const kw = activatedSocialNetworkUI.collecting.getSearchedKeyword()
            setKeyword(kw)
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => {
            window.removeEventListener('locationchange', onLocationChange)
        }
    }, [])
    return keyword
}
