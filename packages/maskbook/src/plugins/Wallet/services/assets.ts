import { values } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { Asset, CollectibleProvider, BalanceRecord, PortfolioProvider, ZerionAddressAsset } from '../types'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import * as DebankAPI from '../apis/debank'
import { CurrencyType } from '../../../web3/types'
import { ChainId, EthereumTokenType } from '../../../web3/types'
import { unreachable } from '../../../utils/utils'
import { createERC1155Token, createERC721Token, createEtherToken, getConstant } from '../../../web3/helpers'
import { formatChecksumAddress } from '../formatter'
import { CONSTANTS } from '../../../web3/constants'

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
            hasNextPage: assets.length === 50,
        }
    }
    return {
        assets: [],
        hasNextPage: false,
    }
}

export async function getAssetsList(address: string, chainId: ChainId, provider: PortfolioProvider): Promise<Asset[]> {
    if (chainId !== ChainId.Mainnet) return []
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
    return data.map(
        (x): Asset => ({
            chain: x.chain,
            token:
                x.id === 'eth'
                    ? createEtherToken(ChainId.Mainnet)
                    : {
                          // distinguish token type
                          type: EthereumTokenType.ERC20,
                          address: formatChecksumAddress(x.id),
                          chainId: ChainId.Mainnet,
                          name: x.name,
                          symbol: x.symbol,
                          decimals: x.decimals,
                      },
            balance: new BigNumber(x.balance).toFixed(),
            price: {
                [CurrencyType.USD]: new BigNumber(x.price).toFixed(),
            },
            value: {
                [CurrencyType.USD]: new BigNumber(x.price)
                    .multipliedBy(new BigNumber(x.balance).dividedBy(new BigNumber(10).pow(x.decimals)))
                    .toFixed(),
            },
            logoURL: x.logo_url,
        }),
    )
}

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

function formatAssetsFromZerion(data: ZerionAddressAsset[]) {
    return data
        .filter(({ asset }) => asset.is_displayable && !filterAssetType.some((type) => type === asset.type))
        .map(({ asset, quantity }) => {
            const balance = Number(new BigNumber(quantity).dividedBy(new BigNumber(10).pow(asset.decimals)).toString())
            return {
                token: {
                    name: asset.name,
                    symbol: asset.symbol,
                    decimals: asset.decimals,
                    address: asset.name === 'Ether' ? getConstant(CONSTANTS, 'ETH_ADDRESS') : asset.asset_code,
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
