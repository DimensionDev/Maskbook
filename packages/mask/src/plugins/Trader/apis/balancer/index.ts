import BigNumber from 'bignumber.js'
import { first, memoize } from 'lodash-unified'
import { SOR } from '@balancer-labs/sor'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ZERO, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, getRPCConstants, getTraderConstants } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'
import { BALANCER_MAX_NO_POOLS, BALANCER_SOR_GAS_PRICE, BALANCER_SWAP_TYPE } from '../../constants'
import type { Route } from '../../types'

// #region create cached SOR
const createSOR_ = memoize(
    (chainId: ChainId) => {
        const { RPC_URLS } = getRPCConstants(chainId)
        const providerURL = first(RPC_URLS)
        if (!providerURL) throw new Error('Unknown chain id.')
        return new SOR(
            // we choose a fixed provider cause it's only used here.
            new JsonRpcProvider(providerURL),
            BALANCER_SOR_GAS_PRICE,
            BALANCER_MAX_NO_POOLS,
            chainId,
            '', // set pools url later
        )
    },
    (chainId: ChainId) => String(chainId),
)

function createSOR(chainId: ChainId) {
    const sor = createSOR_(chainId)

    // update pools url when sor object was created or reused
    sor.poolsUrl = `${getTraderConstants(chainId).BALANCER_POOLS_URL}?timestamp=${Date.now()}`

    return sor
}
// #endregion

export async function updatePools(force = false, chainId?: ChainId) {
    const currentChainId = chainId ?? currentChainIdSettings.value
    const sor = createSOR(currentChainId)

    // this fetches all pools list from URL in constructor then onChain balances using Multicall
    if (!sor.isAllFetched || force) {
        sor.poolsUrl = `${getTraderConstants(currentChainId).BALANCER_POOLS_URL}?timestamp=${Date.now()}`
        await sor.fetchPools()
    }
}

export async function getSwaps(
    tokenIn: string,
    tokenOut: string,
    swapType: BALANCER_SWAP_TYPE,
    amount: string,
    targetChainId?: ChainId,
) {
    const chainId = targetChainId ?? currentChainIdSettings.value
    const sor = createSOR(chainId)

    // this calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
    // can be set once and will be used for further swap calculations.
    // defaults to 0 if not called or can be set manually using: await sor.setCostOutputToken(tokenOut, manualPriceBn)
    await sor.setCostOutputToken(tokenOut)

    // update pools if necessary
    updatePools()

    // get swaps from chain
    const [swaps, tradeAmount, spotPrice] = await sor.getSwaps(tokenIn, tokenOut, swapType, new BigNumber(amount))

    // compose routes
    // learn more: https://github.com/balancer-labs/balancer-frontend/blob/develop/src/components/swap/Routing.vue
    const totalSwapAmount = swaps.reduce((total, rawHops) => total.plus(first(rawHops)?.swapAmount || '0'), ZERO)

    const pools = sor.onChainCache.pools
    const routes = swaps.map((rawHops) => {
        const swapAmount = new BigNumber(first(rawHops)?.swapAmount || '0')
        const share = swapAmount.div(totalSwapAmount).toNumber()
        const hops = rawHops.map((rawHop) => {
            const { swapAmount } = rawHop
            const tokenIn = rawHop.tokenIn
            const tokenOut = rawHop.tokenOut
            const rawPool = pools.find((pool) => pool.id === rawHop.pool)
            if (!rawPool) return {}
            const totalWeight = new BigNumber(rawPool.totalWeight)
            const pool = {
                address: rawPool.id,
                tokens: rawPool.tokens
                    .map((token) => {
                        const address = token.address
                        const weight = new BigNumber(token.denormWeight)
                        const share = weight.div(totalWeight).toNumber()
                        return {
                            address,
                            share,
                        }
                    })
                    .sort((a, b) => {
                        if (isSameAddress(a.address, tokenIn) || isSameAddress(b.address, tokenOut)) return -1
                        if (isSameAddress(a.address, tokenOut) || isSameAddress(b.address, tokenIn)) return 1
                        return a.share - b.share
                    })
                    .filter((token, index, tokens) => {
                        // Show first 2 and last 2 tokens
                        return index < 2 || index > tokens.length - 3
                    }),
            }
            return {
                pool,
                tokenIn,
                tokenOut,
                swapAmount,
            }
        })
        return {
            share,
            hops,
        }
    }) as Route[]

    return {
        swaps: [swaps, tradeAmount, spotPrice] as const,
        routes,
    }
}
