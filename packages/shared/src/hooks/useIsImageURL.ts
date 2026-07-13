import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { resolveResourceURL } from '@masknet/web3-shared-base'

// filter out nft with image resource
export function useIsImageURL(url: string | undefined): AsyncState<boolean> {
    return useAsync(async () => {
        const resolvedURL = resolveResourceURL(url)
        if (!resolvedURL) return false
        if (resolvedURL.startsWith('data:image')) return true

        const { pathname } = new URL(resolvedURL)
        if (/\.(gif|svg|png|webp|jpg|jpeg)$/u.test(pathname)) return true
        return !/\.(mp4|webm|mov|ogg|mp3|wav)$/u.test(pathname)
    }, [url])
}
