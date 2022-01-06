import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-solana'
import { CoinGecko } from '@masknet/web3-providers'
import { createFungibleAsset, createFungibleToken } from '../helpers'

async function getTokenBalance(
    chainId: ChainId,
    account: string,
    decimals: number,
    {
        fungibleTokenAddress,
        tokenAddress,
        exportKey,
        storageKey,
    }: {
        fungibleTokenAddress: string
        tokenAddress: string
        exportKey: string
        storageKey: string
    },
) {
    return '0'
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('tether', CurrencyType.USD)
    const balance = await getTokenBalance(chainId, account, 6, {
        fungibleTokenAddress: FUNGIBLE_TOKEN_ADDRESS,
        tokenAddress: TETHER_ADDRESS,
        exportKey: 'TeleportedTetherToken',
        storageKey: 'teleportedTetherTokenBalance',
    })

    return createFungibleAsset(
        createFungibleToken(chainId, TETHER_ADDRESS, 'Tether USD', 'tUSD', 6),
        balance,
        new URL('../assets/tUSD.png', import.meta.url).toString(),
        price,
    )
}

export async function getFungibleAssets(
    address: string,
    provider: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset<Web3Plugin.FungibleToken>[]> {
    const allSettled = await Promise.allSettled([getAssetTether(network.chainId, address)])

    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .filter(Boolean) as Web3Plugin.Asset<Web3Plugin.FungibleToken>[]
}
