import { useAsyncRetry } from 'react-use'
import type { ERC721TokenAssetDetailed, ERC721TokenDetailed } from '../types'

export function useERC721TokenAssetDetailed(token?: ERC721TokenDetailed) {
    return useAsyncRetry(async () => {
        if (!token?.tokenURI) return
        const response = await fetch(token.tokenURI)
        const asset = (await response.json()) as ERC721TokenAssetDetailed['asset']
        return {
            ...token,
            asset,
        } as ERC721TokenAssetDetailed
    }, [token?.tokenURI])
}
