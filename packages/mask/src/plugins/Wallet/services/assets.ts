import { unreachable } from '@dimensiondev/kit'
import { leftShift, multipliedBy, rightShift } from '@masknet/web3-shared-base'
import {
    Asset,
    ChainId,
    NonFungibleAssetProvider,
    createERC20Token,
    createERC721Token,
    createNativeToken,
    CurrencyType,
    EthereumTokenType,
    ERC721TokenDetailed,
    formatEthereumAddress,
    getChainIdFromName,
    getTokenConstants,
    isChainIdMainnet,
    NetworkType,
    FungibleAssetProvider,
    getChainShortName,
    getChainIdFromNetworkType,
    ERC721TokenCollectionInfo,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { values } from 'lodash-unified'
import { EthereumAddress } from 'wallet.ts'
import * as DebankAPI from '../apis/debank'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import { resolveChainByScope, resolveZerionAssetsScopeName } from '../pipes'
import type {
    SocketRequestAssetScope,
    WalletTokenRecord,
    ZerionAddressAsset,
    ZerionAddressCovalentAsset,
    ZerionAsset,
    ZerionCovalentAsset,
} from '../types'

export async function getCollectionsNFT(
    address: string,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page?: number,
    size?: number,
): Promise<{ collections: ERC721TokenCollectionInfo[]; hasNextPage: boolean }> {
    if (provider === NonFungibleAssetProvider.OPENSEA) {
        const { collections } = await OpenSeaAPI.getCollections(address, { chainId, page, size })

        return {
            collections: collections.map((x) => ({
                name: x.name,
                image: x.image_url || undefined,
                slug: x.slug,
            })),
            hasNextPage: collections.length === size,
        }
    }

    return {
        collections: [],
        hasNextPage: false,
    }
}

export async function getAssetsListNFT(
    address: string,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page?: number,
    size?: number,
    collection?: string,
): Promise<{ assets: ERC721TokenDetailed[]; hasNextPage: boolean }> {
    if (provider === NonFungibleAssetProvider.OPENSEA) {
        const { assets } = await OpenSeaAPI.getAssetsList(address, { chainId, page, size, collection })
        return {
            assets: assets
                .filter(
                    (x) =>
                        ['non-fungible', 'semi-fungible'].includes(x.asset_contract.asset_contract_type) ||
                        ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
                )
                .map((x) =>
                    createERC721Token(
                        {
                            chainId: ChainId.Mainnet,
                            type: EthereumTokenType.ERC721,
                            name: x.asset_contract.name,
                            symbol: x.asset_contract.symbol,
                            address: x.asset_contract.address,
                        },
                        {
                            owner: address,
                            name: x.name || x.asset_contract.name,
                            description: x.description || x.asset_contract.symbol,
                            mediaUrl: x.image_url || x.image_preview_url || x.asset_contract.image_url || '',
                        },
                        x.token_id,
                    ),
                ),
            hasNextPage: assets.length === size,
        }
    }
    return {
        assets: [],
        hasNextPage: false,
    }
}

export async function getAssetsList(
    address: string,
    provider: FungibleAssetProvider,
    network?: NetworkType,
): Promise<Asset[]> {
    if (!EthereumAddress.isValid(address)) return []
    switch (provider) {
        case FungibleAssetProvider.ZERION:
            let result: Asset[] = []
            //xdai-assets is not support
            const scopes = network
                ? [resolveZerionAssetsScopeName(network)]
                : ['assets', 'bsc-assets', 'polygon-assets', 'arbitrum-assets']
            for (const scope of scopes) {
                const { meta, payload } = await ZerionAPI.getAssetsList(address, scope)
                if (meta.status !== 'ok') throw new Error('Fail to load assets.')

                const assets = Object.entries(payload).map(([key, value]) => {
                    if (key === 'assets') {
                        const assetsList = (values(value) as ZerionAddressAsset[]).filter(
                            ({ asset }) =>
                                asset.is_displayable &&
                                !filterAssetType.some((type) => type === asset.type) &&
                                asset.icon_url,
                        )
                        return formatAssetsFromZerion(assetsList, key)
                    }

                    return formatAssetsFromZerion(
                        values(value) as ZerionAddressCovalentAsset[],
                        key as SocketRequestAssetScope,
                    )
                })

                result = [...result, ...assets.flat()]
            }

            return result
        case FungibleAssetProvider.DEBANK:
            const data = await DebankAPI.getAssetsList(address)
            return formatAssetsFromDebank(data, network)
        default:
            unreachable(provider)
    }
}

function formatAssetsFromDebank(data: WalletTokenRecord[], network?: NetworkType) {
    return data
        .filter((x) => !network || getChainIdFromName(x.chain) === getChainIdFromNetworkType(network))
        .filter((x) => x.is_verified)
        .map((y): Asset => {
            const chainIdFromChain = getChainIdFromName(y.chain) ?? ChainId.Mainnet
            // the asset id is the token address or the name of the chain
            const chainIdFromId = getChainIdFromName(y.id)
            return {
                chain: getChainShortName(chainIdFromChain).toLowerCase(),
                token:
                    chainIdFromId && isChainIdMainnet(chainIdFromId)
                        ? createNativeToken(chainIdFromChain)
                        : createERC20Token(
                              chainIdFromChain,
                              formatEthereumAddress(y.id),
                              y.decimals,
                              y.name,
                              y.symbol,
                              y.logo_url ? [y.logo_url] : undefined,
                          ),
                balance: rightShift(y.amount, y.decimals).toFixed(),
                price: {
                    [CurrencyType.USD]: new BigNumber(y.price ?? 0).toFixed(),
                },
                value: {
                    [CurrencyType.USD]: multipliedBy(y.price ?? 0, y.amount).toFixed(),
                },
                logoURI: y.logo_url,
            }
        })
}

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

function formatAssetsFromZerion(
    data: ZerionAddressAsset[] | ZerionAddressCovalentAsset[],
    scope: SocketRequestAssetScope,
) {
    return data.map(({ asset, quantity }) => {
        const balance = leftShift(quantity, asset.decimals).toNumber()
        const value = (asset as ZerionAsset).price?.value ?? (asset as ZerionCovalentAsset).value ?? 0
        const isNativeToken = (symbol: string) => ['ETH', 'BNB', 'MATIC', 'ARETH'].includes(symbol)

        return {
            token: {
                name: asset.name,
                symbol: asset.symbol,
                decimals: asset.decimals,
                address: isNativeToken(asset.symbol) ? getTokenConstants().NATIVE_TOKEN_ADDRESS : asset.asset_code,
                chainId: resolveChainByScope(scope).chainId,
                type: isNativeToken(asset.symbol) ? EthereumTokenType.Native : EthereumTokenType.ERC20,
                logoURI: asset.icon_url,
            },
            chain: resolveChainByScope(scope).chain,
            balance: quantity,
            price: {
                usd: new BigNumber(value).toString(),
            },
            value: {
                usd: multipliedBy(balance, value).toString(),
            },
            logoURI: asset.icon_url,
        }
    }) as Asset[]
}
