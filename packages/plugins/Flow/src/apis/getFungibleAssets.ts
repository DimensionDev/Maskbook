import BigNumber from 'bignumber.js'
import type { Pagination, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-flow'
import { createFungibleAsset, createFungibleToken } from '../helpers'
import { fetchBalanceFLOW, fetchBalanceFUSD, fetchBalanceUSDT } from '../scripts'

function pow10(amount: string, decimals: number) {
    return new BigNumber(amount)
        .multipliedBy(10 ** decimals)
        .integerValue()
        .toFixed()
}

async function getAssetFUSD(chainId: ChainId, account: string) {
    const { FUSD_ADDRESS = '' } = getTokenConstants(chainId)

    return createFungibleAsset(
        createFungibleToken(chainId, FUSD_ADDRESS, 'Flow USD', 'FUSD', 8),
        pow10(await fetchBalanceFUSD(chainId, account), 8),
        new URL('../assets/FUSD.png', import.meta.url).toString(),
    )
}

async function getAssetFLOW(chainId: ChainId, account: string) {
    const { FLOW_ADDRESS = '' } = getTokenConstants(chainId)

    return createFungibleAsset(
        createFungibleToken(chainId, FLOW_ADDRESS, 'Flow', 'FLOW', 8),
        pow10(await fetchBalanceFLOW(chainId, account), 8),
        new URL('../assets/flow.png', import.meta.url).toString(),
    )
}

async function getAssetTether(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '' } = getTokenConstants(chainId)

    return createFungibleAsset(
        createFungibleToken(chainId, TETHER_ADDRESS, 'Tether USD', 'tUSD', 8),
        pow10(await fetchBalanceUSDT(chainId, account), 8),
        new URL('../assets/tUSD.png', import.meta.url).toString(),
    )
}

export async function getFungibleAssets(
    address: string,
    providerType: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset[]> {
    const allSettled = await Promise.allSettled([
        getAssetFUSD(network.chainId, address),
        getAssetFLOW(network.chainId, address),
        getAssetTether(network.chainId, address),
    ])

    console.log(allSettled)

    return allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter(Boolean) as Web3Plugin.Asset[]
}
