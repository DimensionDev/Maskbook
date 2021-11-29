import { useAsyncRetry } from 'react-use'
import { AddressNameType } from '../types'
import { useWeb3Context } from '../context'

export function useAddressNames(twitterId: string) {
    const { getAddressNamesList } = useWeb3Context()

    return useAsyncRetry(async () => {
        return getAddressNamesList(twitterId, AddressNameType.ENS)
    }, [twitterId])
}
