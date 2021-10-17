import { useAsyncRetry } from 'react-use'
import { AddressNameType, useWeb3Context } from '..'

export function useAddressNames(twitterId: string) {
    const { getAddressNamesList } = useWeb3Context()

    return useAsyncRetry(async () => {
        return getAddressNamesList(twitterId, AddressNameType.ENS)
    }, [twitterId])
}
