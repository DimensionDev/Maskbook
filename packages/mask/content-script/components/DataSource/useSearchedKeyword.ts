import { useEffect, useState } from 'react'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'

function getKeyword() {
    if (!activatedSiteAdaptorUI?.collecting?.getSearchedKeyword) return
    return activatedSiteAdaptorUI!.collecting.getSearchedKeyword()
}
export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState(getKeyword)

    useEffect(() => {
        function onLocationChange() {
            setKeyword(getKeyword())
        }
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [])
    return keyword
}
