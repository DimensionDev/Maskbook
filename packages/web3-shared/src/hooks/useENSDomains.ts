import { useAsyncRetry } from 'react-use'
import { DomainType, useWeb3Context } from '..'

export function useENSDomains(twitterId: string) {
    const { getDomainsList } = useWeb3Context()

    return useAsyncRetry(async () => {
        return getDomainsList(twitterId, DomainType.ENS)
    }, [twitterId])
}
