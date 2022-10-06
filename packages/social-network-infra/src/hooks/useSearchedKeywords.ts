import { useEffect, useState } from 'react'
import { useSocialNetwork } from './useContext.js'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState('')
    const socialNetwork = useSocialNetwork()

    useEffect(() => {
        const onLocationChange = () => {
            if (!socialNetwork?.collecting?.getSearchedKeyword) return
            const kw = socialNetwork.collecting.getSearchedKeyword()
            setKeyword(kw)
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => {
            window.removeEventListener('locationchange', onLocationChange)
        }
    }, [socialNetwork])
    return keyword
}
