import { Twitter } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useNFTContainerAtTwitter(screenName: string): AsyncState<{ address: string; token_id: string }> {
    return useAsyncRetry(() => Twitter.getUserNftContainer(screenName), [Twitter, screenName])
}
