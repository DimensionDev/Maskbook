import { useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { Twitter } from '@masknet/web3-providers'

export function useNFTContainerAtTwitter(screenName?: string): AsyncState<{ address: string; token_id: string }> {
    return useAsyncRetry(async () => {
        if (!screenName) return
        return Twitter.getUserNftContainer(screenName)
    }, [screenName])
}
