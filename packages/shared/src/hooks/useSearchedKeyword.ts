import { useEffect, useState } from 'react'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')
    const context = useSiteAdaptorContext()

    useEffect(() => {
        const onLocationChange = () => {
            if (!context?.getSearchedKeyword) return
            const kw = context?.getSearchedKeyword()
            setKeyword(kw)
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => {
            window.removeEventListener('locationchange', onLocationChange)
        }
    }, [context?.getSearchedKeyword])
    return keyword
}
