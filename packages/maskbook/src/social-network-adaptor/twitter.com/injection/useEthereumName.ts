import { useResolveENS, useResolveUNS, useAddressNames } from '@masknet/web3-shared'
import { useEffect, useMemo, useState } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { EthereumAddress } from 'wallet.ts'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ENS_RE_FULL = new RegExp(`^${ENS_RE.source}$`)
const ADDRESS_FULL = /0x\w+/

export function useEthereumName(nickname: string, twitterId: string, bio: string) {
    const [ethereumName, setEthereumName] = useState('')

    useEffect(() => {
        const matched = bio.match(ENS_RE)
        setEthereumName(matched ? matched[0] : '')
    }, [bio])
    const name = useMemo(() => {
        const matched = nickname.match(ENS_RE)
        if (matched) {
            return matched[0]
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
    const { value: names = [], loading: loadingAddressNames } = useAddressNames(twitterId)

    const ownerAddress = names.find((x) => x.ownerAddress)?.ownerAddress || address

    useEffect(() => {
        setAddress('')
        const matched = bio.match(ADDRESS_FULL)
        if (matched?.[0] && EthereumAddress.isValid(matched[0])) setAddress(matched[0])
    }, [bio])

    const isLoading = loadingAddressENS || loadingAddressUNS || loadingAddressNames

    return {
        loading: isLoading,
        value: isLoading
            ? undefined
            : {
                  type: addressENS ? 'ENS' : addressUNS ? 'UNS' : 'address',
                  name: addressENS || addressUNS ? name : '',
                  address: isLoading ? '' : addressENS ?? addressUNS ?? ownerAddress ?? '',
              },
        error: undefined,
    } as AsyncState<{
        type: string
        name: string
        address: string
    }>
}
