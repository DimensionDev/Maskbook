import { values } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { AssetDetailed, AssetProvider, BalanceRecord, PortfolioProvider, ZerionAddressAsset } from '../types'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import * as DebankAPI from '../apis/debank'
import { CurrencyType } from '../../../web3/types'
import { ChainId, EthereumTokenType } from '../../../web3/types'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { unreachable } from '../../../utils/utils'
import { createEtherToken } from '../../../web3/helpers'
import { formatChecksumAddress } from '../formatter'

export async function getAssetsListNFT(address: string, provider: AssetProvider) {
    if (provider === AssetProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address)
        return assets.map(
            (x): AssetInCard => ({
                asset_contract: {
                    address: x.asset_contract.address,
                    symbol: x.asset_contract.symbol,
                    schema_name: x.asset_contract.schema_name,
                },
                token_id: x.token_id,
                name: x.name ?? x.collection.slug,
                image: x.image_url ?? x.image_preview_url ?? '',
                permalink: x.permalink,
            }),
        )
    }
    return []
}

export async function getAssetsList(address: string, provider: PortfolioProvider): Promise<AssetDetailed[]> {
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
        (x): AssetDetailed => ({
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
        }) as AssetDetailed[]
}
