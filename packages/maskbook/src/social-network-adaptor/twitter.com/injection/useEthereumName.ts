import { useResolveEns } from '@masknet/web3-shared'
import { useEffect, useMemo, useState } from 'react'
import { getBioDescription, getNickname, getTwitterId } from '../utils/user'

const ENS_RE = /\w+\.eth/
const ENS_RE_FULL = /^\w+\.eth$/
const ADDRESS = /0x[\dA-Fa-f]{40}/

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
        if (ENS_RE_FULL.test(nickname)) {
            return nickname
        }
        if (ethereumName) return ethereumName
        return twitterId ? `${twitterId}.eth` : ''
    }, [ethereumName, nickname, twitterId])

    return name
}

export function useEthereumAddress() {
    const bioDescription = getBioDescription()
    const [addr, setAddr] = useState<string | undefined>()
    const name = useEthereumName()
    const ens_addr = useResolveEns(name).value

    useEffect(() => {
        const matched = bioDescription.match(ADDRESS)
        if (matched) setAddr(matched[0])
    }, [bioDescription])

    return ens_addr ?? addr
}
