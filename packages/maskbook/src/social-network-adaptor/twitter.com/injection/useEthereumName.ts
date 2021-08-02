import { useEffect, useMemo, useState } from 'react'
import { getBioDescription, getNickname, getTwitterId } from '../utils/user'

const ENS_RE = /\w+\.eth/
const ENS_RE_FULL = /^\w+\.eth$/

export function useEthereumName() {
    const [ethereumName, setEthereumName] = useState('')
    const nickname = getNickname()
    const twitterId = getTwitterId()
    const bioDescription = getBioDescription()

    useEffect(() => {
        const matched = bioDescription.match(ENS_RE)
        if (matched) {
            setEthereumName(matched[0])
        }
    }, [bioDescription])
    const name = useMemo(() => {
        if (ethereumName) return ethereumName

        if (ENS_RE_FULL.test(nickname)) {
            return nickname
        }
        return `${twitterId}.eth`
    }, [ethereumName, nickname, twitterId])

    return name
}
