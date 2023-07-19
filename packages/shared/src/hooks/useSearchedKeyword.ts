import { useEffect, useState } from 'react'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')
    const { getSearchedKeyword } = useSNSAdaptorContext()

    useEffect(() => {
        const onLocationChange = () => {
            if (!getSearchedKeyword) return
            const kw = getSearchedKeyword()
            setKeyword(kw)
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => {
            window.removeEventListener('locationchange', onLocationChange)
        }
    }, [getSearchedKeyword])
    return keyword
}
