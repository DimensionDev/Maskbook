import { leftShift, multipliedBy } from '@masknet/web3-shared-base'
import { ChainId, createLookupTableResolver, getTokenConstants, NetworkType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import type {
    SocketRequestAssetScope,
    ZerionAddressAsset,
    ZerionAddressCovalentAsset,
    ZerionAsset,
    ZerionCovalentAsset,
} from './type'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { TokenType } from '@masknet/plugin-infra'

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export const resolveZerionAssetsScopeName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'assets',
        [NetworkType.Binance]: 'bsc-assets',
        [NetworkType.Polygon]: 'polygon-assets',
        [NetworkType.Arbitrum]: 'arbitrum-assets',
        [NetworkType.xDai]: 'xdai-assets',
    },
    '',
)

export const resolveChainByScope = createLookupTableResolver<
    SocketRequestAssetScope,
    {
        chain: string
        chainId?: ChainId
    }
>(
    {
        assets: {
            chain: 'eth',
            chainId: ChainId.Mainnet,
        },
        'bsc-assets': {
            chain: 'bsc',
            chainId: ChainId.BSC,
        },
        'polygon-assets': {
            chain: 'matic',
            chainId: ChainId.Matic,
        },
    },
    {
        chain: 'unknown',
    },
)

export function formatAssets(
    data: ZerionAddressAsset[] | ZerionAddressCovalentAsset[],
    scope: SocketRequestAssetScope,
) {
    return data.map(({ asset, quantity }) => {
        const balance = leftShift(quantity, asset.decimals).toNumber()
        const value = (asset as ZerionAsset).price?.value ?? (asset as ZerionCovalentAsset).value ?? 0
        const isNativeToken = (symbol: string) => ['ETH', 'BNB', 'MATIC', 'ARETH'].includes(symbol)
        const address = isNativeToken(asset.symbol) ? getTokenConstants().NATIVE_TOKEN_ADDRESS : asset.asset_code
        const chainId = resolveChainByScope(scope).chainId

        return {
            id: address,
            chainId: chainId,
            token: {
                id: address,
                name: asset.name,
                symbol: asset.symbol,
                decimals: asset.decimals,
                address: address,
                chainId: chainId,
                type: TokenType.Fungible,
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
