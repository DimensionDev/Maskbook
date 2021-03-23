import { values } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { AssetProvider, ZerionAddressAsset } from '../types'
import * as OpenSeaAPI from '../apis/opensea'
import * as ZerionAPI from '../apis/zerion'
import type { AssetDetailed } from '../../../web3/types'
import { ChainId, EthereumTokenType } from '../../../web3/types'

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

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

// TOOD:
// unify asset from different assets provider
export async function getAssetsList(address: string): Promise<AssetDetailed[]> {
    const { meta, payload } = await ZerionAPI.getAssetsList(address)
    if (meta.status !== 'ok') throw new Error('Fail to load assets.')
    const assetsList = values(payload.assets)
    return formatAssetsFromZerion(assetsList)
}

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
