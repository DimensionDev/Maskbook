import { unreachable } from '@dimensiondev/kit'
import {
    Asset,
    ChainId,
    CollectibleProvider,
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
    PortfolioProvider,
    pow10,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { values } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import * as DebankAPI from '../apis/debank'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import { resolveChainByScope, resolveZerionAssetsScopeName } from '../pipes'
import type {
    BalanceRecord,
    SocketRequestAssetScope,
    ZerionAddressAsset,
    ZerionAddressCovalentAsset,
    ZerionAsset,
    ZerionCovalentAsset,
} from '../types'

export async function getAssetsListNFT(
    address: string,
    chainId: ChainId,
    provider: CollectibleProvider,
    page?: number,
    size?: number,
): Promise<{ assets: ERC721TokenDetailed[]; hasNextPage: boolean }> {
    if (provider === CollectibleProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address, { chainId, page, size })
        return {
            assets: assets
                .filter((x) => ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name))
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
                            name: x.name,
                            description: x.description,
                            image: x.image_url ?? x.image_preview_url ?? '',
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
    network: NetworkType,
    provider: PortfolioProvider,
): Promise<Asset[]> {
    if (!EthereumAddress.isValid(address)) return []
    switch (provider) {
        case PortfolioProvider.ZERION:
            const scope = resolveZerionAssetsScopeName(network)

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

            return assets.flat()
        case PortfolioProvider.DEBANK:
            const { data = [], error_code } = await DebankAPI.getAssetsList(address)
            if (error_code === 0) return formatAssetsFromDebank(data)
            return []
        default:
            unreachable(provider)
    }
}

function formatAssetsFromDebank(data: BalanceRecord[]) {
    return data
        .filter((x) => getChainIdFromName(x.chain))
        .map((y): Asset => {
            const chainId = getChainIdFromName(y.chain) ?? ChainId.Mainnet
            // the asset id is the token address or the name of the chain
            const chainIdFormId = getChainIdFromName(y.id)
            return {
                chain: y.chain,
                token:
                    chainIdFormId && isChainIdMainnet(chainIdFormId)
                        ? createNativeToken(chainId)
                        : createERC20Token(chainId, formatEthereumAddress(y.id), y.decimals, y.name, y.symbol),
                balance: new BigNumber(y.balance).toFixed(),
                price: {
                    [CurrencyType.USD]: new BigNumber(y.price ?? 0).toFixed(),
                },
                value: {
                    [CurrencyType.USD]: new BigNumber(y.price ?? 0)
                        .multipliedBy(new BigNumber(y.balance).dividedBy(pow10(y.decimals)))
                        .toFixed(),
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
        const balance = Number(new BigNumber(quantity).dividedBy(pow10(asset.decimals)).toString())
        const value = (asset as ZerionAsset).price?.value ?? (asset as ZerionCovalentAsset).value ?? 0
        const isNativeToken = (symbol: string) => ['ETH', 'BNB', 'MATIC'].includes(symbol)

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
                usd: new BigNumber(balance).multipliedBy(value).toString(),
            },
            logoURI: asset.icon_url,
        }
    }) as Asset[]
}
