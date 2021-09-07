import { useResolveENS, useResolveUNS } from '@masknet/web3-shared'
import { useEffect, useMemo, useState } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const ENS_RE = /[\w#%+.:=@~-]{1,256}\.(eth|kred|xyz|luxe)\b/
const ENS_RE_FULL = new RegExp(`^${ENS_RE.source}$`)
const ADDRESS = /0x[\dA-Fa-f]{40}/

export function useEthereumName(nickname: string, twitterId: string, bio: string) {
    const [ethereumName, setEthereumName] = useState('')

    useEffect(() => {
        setEthereumName('')
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

export function useEthereumAddress(nickname: string, twitterId: string, bio: string) {
    const [address, setAddress] = useState<string | undefined>()
    const name = useEthereumName(nickname, twitterId, bio)
    const { value: addressENS, loading: loadingAddressENS } = useResolveENS(name)
    const { value: addressUNS, loading: loadingAddressUNS } = useResolveUNS(name)

    useEffect(() => {
        setAddress('')
        const matched = bio.match(ADDRESS)
        if (matched) setAddress(matched[0])
    }, [bio])

    const isLoading = loadingAddressENS || loadingAddressUNS

    return {
        loading: isLoading,
        value: isLoading
            ? undefined
            : {
                  type: addressENS ? 'ENS' : addressUNS ? 'UNS' : 'address',
                  name,
                  address: isLoading ? '' : addressENS ?? addressUNS ?? address ?? '',
              },
        error: undefined,
    } as AsyncState<{
        type: string
        name: string
        address: string
    }>
}
