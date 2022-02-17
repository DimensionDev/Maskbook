import { useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { getTokens, getUserNftContainer } from '../utils'

export function useNFTContainerAtTwitter(screenName: string): AsyncState<{ address: string; token_id: string }> {
    return useAsyncRetry(async () => {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        if (!bearerToken || !queryToken || !csrfToken) return
        const result = await getUserNftContainer(screenName, bearerToken, queryToken, csrfToken)
        if (!result?.data?.user?.result?.has_nft_avatar) return
        return {
            address: result.data.user.result.nft_avatar_metadata.smart_contract.address,
            token_id: result.data.user.result.nft_avatar_metadata.token_id,
        }
    }, [getTokens, screenName])
}
