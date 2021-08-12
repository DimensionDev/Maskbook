import { useResolveEns } from '@masknet/web3-shared'
import { useEffect, useMemo, useState } from 'react'

const ENS_RE = /\w+\.eth/
const ENS_RE_FULL = /^\w+\.eth$/
const ADDRESS = /0x[\dA-Fa-f]{40}/

export function useEthereumName(nickname: string, twitterId: string, bio: string) {
    const [ethereumName, setEthereumName] = useState('')

    useEffect(() => {
        const matched = bio.match(ENS_RE)
        if (matched) {
            setEthereumName(matched[0])
        }
    }, [bio])
    const name = useMemo(() => {
        if (ENS_RE_FULL.test(nickname)) {
            return nickname
        }
        if (ethereumName) return ethereumName
        return twitterId ? `${twitterId}.eth` : ''
    }, [ethereumName, nickname, twitterId])

    return name
}

export function useEthereumAddress(nickanme: string, twitterId: string, bio: string) {
    const [addr, setAddr] = useState<string | undefined>()
    const name = useEthereumName(nickanme, twitterId, bio)
    const ens_addr = useResolveEns(name).value

    useEffect(() => {
        setAddr('')
        const matched = bio.match(ADDRESS)
        if (matched) setAddr(matched[0])
    }, [bio])

    return ens_addr ?? addr
}
