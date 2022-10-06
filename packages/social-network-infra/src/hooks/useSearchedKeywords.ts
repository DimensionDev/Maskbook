import { useEffect, useState } from 'react'
import { useSocialNetwork } from './useContext.js'

export function useSearchedKeyword() {
    const [keyword, setKeyword] = useState<string>()
    const socialNetwork = useSocialNetwork()

    useEffect(() => {
        const onLocationChange = () => {
            if (!socialNetwork?.collecting?.getSearchedKeyword) return
            const newKeyword = socialNetwork.collecting.getSearchedKeyword()
            setKeyword(newKeyword)
        }
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => {
            window.removeEventListener('locationchange', onLocationChange)
        }
    }, [socialNetwork])
    return keyword
}
