import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    createERC1155Token,
    createERC20Token,
    createERC721Token,
    createNativeToken,
    CurrencyType,
    EthereumTokenType,
    formatEthereumAddress,
    getChainDetailed,
    getChainIdFromName,
    getTokenConstants,
    pow10,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { values } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import * as DebankAPI from '../apis/debank'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import { Asset, BalanceRecord, CollectibleProvider, PortfolioProvider, ZerionAddressAsset } from '../types'

export async function getAssetsListNFT(
    address: string,
    chainId: ChainId,
    provider: CollectibleProvider,
    page?: number,
    size?: number,
) {
    if (provider === CollectibleProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address, { chainId, page, size })
        return {
            assets: assets
                .filter((x) => ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name))
                .map((x) => {
                    switch (x.asset_contract.schema_name) {
                        case 'ERC721':
                            return createERC721Token(
                                ChainId.Mainnet,
                                x.token_id,
                                x.asset_contract.address,
                                x.asset_contract.name,
                                x.asset_contract.symbol,
                                '',
                                '',
                                {
                                    name: x.name,
                                    description: x.description,
                                    image: x.image_url ?? x.image_preview_url ?? '',
                                },
                            )
                        case 'ERC1155':
                            return createERC1155Token(
                                ChainId.Mainnet,
                                x.token_id,
                                x.asset_contract.address,
                                x.asset_contract.name,
                                '',
                                {
                                    name: x.name,
                                    description: x.description,
                                    image: x.image_url ?? x.image_preview_url ?? '',
                                },
                            )
                        default:
                            unreachable(x.asset_contract.schema_name)
                    }
                }),
            hasNextPage: assets.length === size,
        }
    }
    return {
        assets: [],
        hasNextPage: false,
    }
}

export async function getAssetsList(address: string, provider: PortfolioProvider): Promise<Asset[]> {
    if (!EthereumAddress.isValid(address)) return []
    switch (provider) {
        case PortfolioProvider.ZERION:
            const { meta, payload } = await ZerionAPI.getAssetsList(address)
            if (meta.status !== 'ok') throw new Error('Fail to load assets.')
            // skip NFT assets
            const assetsList = values(payload.assets).filter((x) => x.asset.is_displayable && x.asset.icon_url)
            return formatAssetsFromZerion(assetsList)
        case PortfolioProvider.DEBANK:
            const { data = [], error_code } = await DebankAPI.getAssetsList(address)
            if (error_code === 0) return formatAssetsFromDebank(data)
            return []
        default:
            unreachable(provider)
    }
}

function formatAssetsFromDebank(data: BalanceRecord[]) {
    return data.map((x): Asset => {
        const chainId = getChainIdFromName(x.id)
        return {
            chain: x.chain,
            token:
                chainId && getChainDetailed(chainId)?.network === 'mainnet'
                    ? createNativeToken(getChainIdFromName(x.id) ?? ChainId.Mainnet)
                    : createERC20Token(
                          getChainIdFromName(x.chain) ?? ChainId.Mainnet,
                          formatEthereumAddress(x.id),
                          x.decimals,
                          x.name,
                          x.symbol,
                      ),
            balance: new BigNumber(x.balance).toFixed(),
            price: {
                [CurrencyType.USD]: new BigNumber(x.price).toFixed(),
            },
            value: {
                [CurrencyType.USD]: new BigNumber(x.price)
                    .multipliedBy(new BigNumber(x.balance).dividedBy(pow10(x.decimals)))
                    .toFixed(),
            },
            logoURL: x.logo_url,
        }
    })
}

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

function formatAssetsFromZerion(data: ZerionAddressAsset[]) {
    return data
        .filter(({ asset }) => asset.is_displayable && !filterAssetType.some((type) => type === asset.type))
        .map(({ asset, quantity }) => {
            const balance = Number(new BigNumber(quantity).dividedBy(pow10(asset.decimals)).toString())
            return {
                token: {
                    name: asset.name,
                    symbol: asset.symbol,
                    decimals: asset.decimals,
                    address: asset.name === 'Ether' ? getTokenConstants().NATIVE_TOKEN_ADDRESS : asset.asset_code,
                    chainId: ChainId.Mainnet,
                    type: asset.name === 'Ether' ? EthereumTokenType.Native : EthereumTokenType.ERC20,
                },
                chain: 'eth',
                balance: quantity,
                price: {
                    usd: new BigNumber(asset.price?.value ?? 0).toString(),
                },
                value: {
                    usd: new BigNumber(balance).multipliedBy(asset.price?.value ?? 0).toString(),
                },
                logoURL: asset.icon_url,
            }
        }) as Asset[]
}
