import { values } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { Asset, CollectibleProvider, BalanceRecord, PortfolioProvider, ZerionAddressAsset } from '../types'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import * as DebankAPI from '../apis/debank'
import { CurrencyType } from '../../../web3/types'
import { ChainId, EthereumTokenType } from '../../../web3/types'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { unreachable } from '../../../utils/utils'
import { createERC1155Token, createERC721Token, createEtherToken } from '../../../web3/helpers'
import { formatChecksumAddress } from '../formatter'

export async function getAssetsListNFT(address: string, provider: CollectibleProvider, page?: number) {
    if (provider === CollectibleProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address, { page })
        return assets
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
            })
    }
    return []
}

export async function getAssetsList(address: string, provider: PortfolioProvider): Promise<Asset[]> {
    if (!EthereumAddress.isValid(address)) return []
    switch (provider) {
        case PortfolioProvider.ZERION:
            const { meta, payload } = await ZerionAPI.getAssetsList(address)
            if (meta.status !== 'ok') throw new Error('Fail to load assets.')
            const assetsList = values(payload.assets)
            return formatAssetsFromZerion(assetsList)
        case PortfolioProvider.DEBANK:
            if ((await getChainId()) !== ChainId.Mainnet) return []
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
                    address: asset.name,
                    chainId: ChainId.Mainnet,
                    type: EthereumTokenType.ERC20,
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
