import {
    createPageable,
    HubOptions,
    NetworkPluginID,
    NonFungibleToken,
    Pageable,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId as ChainId_EVM, SchemaType as SchemaType_EVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainId_FLOW, SchemaType as SchemaType_FLOW } from '@masknet/web3-shared-flow'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '..'
import { fetchJSON } from '../helpers'
import { AlchemyNetworkMap } from './constants'
import type { AlchemyNFT_EVM, AlchemyNFT_FLOW, AlchemyResponse_EVM, AlchemyResponse_FLOW } from './types'

export * from './constants'
export class AlchemyNFTAPI
    implements NonFungibleTokenAPI.Provider<ChainId_EVM | ChainId_FLOW, SchemaType_EVM | SchemaType_FLOW, string>
{
    getTokens = async <tokenChainId extends ChainId_EVM | ChainId_FLOW, tokenSchemaType>(
        from: string,
        opts?: HubOptions<tokenChainId, string | number>,
    ): Promise<Pageable<NonFungibleToken<tokenChainId, tokenSchemaType>, string | number>> => {
        const chainInfo = AlchemyNetworkMap?.find((network) => network.network === opts?.networkPluginId)?.chains?.find(
            (chain) => chain.chainId === opts?.chainId,
        )

        let res
        let assets
        if (opts?.networkPluginId === NetworkPluginID.PLUGIN_EVM) {
            res = await fetchJSON<AlchemyResponse_EVM>(
                urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTs/`, {
                    owner: from,
                    pageKey: opts?.indicator === '' ? opts?.indicator : undefined,
                }),
            )
            assets = res?.ownedNfts?.map((nft) =>
                createNftToken_EVM((opts?.chainId as ChainId_EVM | undefined) ?? ChainId_EVM.Mainnet, nft),
            )
            return createPageable(assets, res?.pageKey ?? '')
        } else if (opts?.networkPluginId === NetworkPluginID.PLUGIN_FLOW) {
            res = await fetchJSON<AlchemyResponse_FLOW>(
                urlcat(`${chainInfo?.baseURL}${chainInfo?.API_KEY}/getNFTs/`, {
                    owner: from,
                }),
            )
            assets = res?.nfts?.map((nft) =>
                createNftToken_FLOW((opts?.chainId as ChainId_FLOW | undefined) ?? ChainId_FLOW.Mainnet, nft),
            )
            return createPageable(assets, '')
        }

        return createPageable([], '')
    }
}

function createNftToken_EVM(
    chainId: ChainId_EVM | ChainId_FLOW,
    asset: AlchemyNFT_EVM,
): NonFungibleToken<ChainId_EVM | ChainId_FLOW, SchemaType_EVM | SchemaType_FLOW> {
    return {
        id: asset.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
        address: asset.contract?.address,
        metadata: {
            chainId,
            name: asset?.metadata?.name ?? asset?.title,
            symbol: '',
            description: asset.description,
            imageURL: asset?.metadata?.image ?? asset?.media?.[0]?.gateway ?? '',
            mediaURL: asset?.media?.[0]?.gateway,
        },
        contract: {
            chainId,
            schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType_EVM.ERC721 : SchemaType_EVM.ERC1155,
            address: asset?.contract?.address,
            name: asset?.metadata?.name ?? asset?.title,
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: asset.description,
        },
    }
}

function createNftToken_FLOW(
    chainId: ChainId_FLOW,
    asset: AlchemyNFT_FLOW,
): NonFungibleToken<ChainId_FLOW, SchemaType_FLOW> {
    return {
        id: asset.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: SchemaType_FLOW.NonFungible,
        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
        address: asset.contract?.address,
        metadata: {
            chainId,
            name: asset?.contract?.name ?? '',
            symbol: '',
            description: asset.description,
            imageURL: asset?.metadata?.metadata?.find((data) => data?.name === 'img')?.value,
            mediaURL: asset?.media?.uri,
        },
        contract: {
            chainId,
            schema: SchemaType_FLOW.NonFungible,
            address: asset?.contract?.address,
            name: asset?.contract?.name ?? '',
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: asset.description,
        },
    }
}
