import { useAsyncRetry } from 'react-use'
import type { ERC1155TokenAssetDetailed, ERC1155TokenDetailed } from '../types'

export function useERC1155TokenAssetDetailed(token?: ERC1155TokenDetailed) {
    return useAsyncRetry(async () => {
        if (!token?.uri) return
        const response = await fetch(token.uri)
        const asset = (await response.json()) as ERC1155TokenAssetDetailed['asset']
        return {
            ...token,
            asset,
        } as ERC1155TokenAssetDetailed
    }, [token?.uri])
}
