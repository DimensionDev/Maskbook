import BigNumber from 'bignumber.js'
import { memoize } from 'lodash-es'
import { SOR } from '@balancer-labs/sor'
import { JsonRpcProvider } from '@ethersproject/providers'
import { getChainId } from '../../../../extension/background-script/EthereumService'
import { getConstant } from '../../../../web3/helpers'
import type { ChainId } from '../../../../web3/types'
import { BALANCER_MAX_NO_POOLS, BALANCER_SOR_GAS_PRICE, BALANCER_SWAP_TYPE, TRADE_CONSTANTS } from '../../constants'
import { CONSTANTS } from '../../../../web3/constants'

//#region the pools cache management
const fetchedCache = new Map<ChainId, number>()

function isFetchedCacheExpired(chainId: ChainId) {
    return (fetchedCache.get(chainId) ?? -1) !== new Date().getHours()
}

function updateFetchedCache(chainId: ChainId) {
    fetchedCache.set(chainId, new Date().getHours())
}
//#endregion

const createSOR = memoize(
    (chainId: ChainId) => {
        const provider = new JsonRpcProvider(getConstant(CONSTANTS, 'INFURA_ADDRESS', chainId))
        const poolsUrl = getConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS', chainId)
        return new SOR(provider, BALANCER_SOR_GAS_PRICE, BALANCER_MAX_NO_POOLS, chainId, poolsUrl)
    },
    (chainId: ChainId) => String(chainId),
)

export async function getBalancerSwaps(
    tokenIn: string,
    tokenOut: string,
    swapType: BALANCER_SWAP_TYPE,
    amount: string,
) {
    const chainId = await getChainId()
    const sor = createSOR(chainId)

    // this fetches all pools list from URL in constructor then onChain balances using Multicall
    if (!sor.isAllFetched) {
        await sor.fetchPools()
        updateFetchedCache(chainId)
    }

    // if sor is expired then update in the non-blocking way
    if (sor.isAllFetched && isFetchedCacheExpired(chainId)) sor.fetchPools().then(() => updateFetchedCache(chainId))

    // this calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
    // can be set once and will be used for further swap calculations.
    // defaults to 0 if not called or can be set manually using: await sor.setCostOutputToken(tokenOut, manualPriceBn)
    await sor.setCostOutputToken(tokenOut)

    return sor.getSwaps(tokenIn, tokenOut, swapType, new BigNumber(amount))
}
