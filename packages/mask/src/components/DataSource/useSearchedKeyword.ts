import { useEffect, useState } from 'react'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        const onLocationChange = () => {
            if (!activatedSiteAdaptorUI?.collecting?.getSearchedKeyword) return
            const kw = activatedSiteAdaptorUI!.collecting.getSearchedKeyword()
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
