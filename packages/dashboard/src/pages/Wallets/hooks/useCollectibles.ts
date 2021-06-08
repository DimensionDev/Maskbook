import type { CollectibleProvider } from '../types'
import {
    createERC721Token,
    ERC1155TokenAssetDetailed,
    ERC721TokenAssetDetailed,
    isSameAddress,
    useChainId,
} from '@dimensiondev/web3-shared'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../../../API'
import { uniqWith } from 'lodash-es'

export function useCollectibles(
    address: string,
    provider: CollectibleProvider,
    page: number,
): AsyncStateRetry<{
    collectibles: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]
    hasNextPage: boolean
}> {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!address) {
            return {
                collectibles: [],
                hasNextPage: false,
            }
        }

        const result = await PluginServices.Wallet.getAssetsListNFT(address.toLowerCase(), chainId, provider, page, 20)

        const erc721Tokens = await PluginServices.Wallet.getERC721TokensPaged(page, 50)

        return {
            collectibles: uniqWith(
                [
                    ...result.assets,
                    ...erc721Tokens.map((x) =>
                        createERC721Token(x.chainId, x.tokenId, x.address, x.name, x.symbol, x.baseURI, x.tokenURI, {
                            name: x.assetName,
                            description: x.assetDescription,
                            image: x.assetImage,
                        }),
                    ),
                ],
                (a, b) => isSameAddress(a.address, b.address) && a.tokenId === b.tokenId,
            ),
            hasNextPage: result.hasNextPage,
        }
    }, [address, provider, page])
}
