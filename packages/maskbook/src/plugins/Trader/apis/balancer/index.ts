import BigNumber from 'bignumber.js'
import { SOR } from '@balancer-labs/sor'
import { JsonRpcProvider } from '@ethersproject/providers'
import { getChainId } from '../../../../extension/background-script/EthereumService'
import { getConstant } from '../../../../web3/helpers'
import type { ChainId } from '../../../../web3/types'
import { BALANCER_MAX_NO_POOLS, BALANCER_SOR_GAS_PRICE, BALANCER_SWAP_TYPE, TRADE_CONSTANTS } from '../../constants'
import { CONSTANTS } from '../../../../web3/constants'

async function createProvider(chainId: ChainId) {
    return new JsonRpcProvider(getConstant(CONSTANTS, 'INFURA_ADDRESS', chainId))
}

async function createSOR(tokenOut: string, chainId?: ChainId) {
    const chainId_ = chainId ?? (await getChainId())
    const provider = await createProvider(chainId_)
    const poolsUrl = getConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS', chainId_)
    const sor = new SOR(provider, BALANCER_SOR_GAS_PRICE, BALANCER_MAX_NO_POOLS, chainId_, poolsUrl)

    // this fetches all pools list from URL in constructor then onChain balances using Multicall
    await sor.fetchPools()

    // this calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
    // can be set once and will be used for further swap calculations.
    // defaults to 0 if not called or can be set manually using: await sor.setCostOutputToken(tokenOut, manualPriceBn)
    await sor.setCostOutputToken(tokenOut)

    return sor
}

export async function getBalancerSwaps(
    tokenIn: string,
    tokenOut: string,
    swapType: BALANCER_SWAP_TYPE,
    amount: string,
) {
    const sor = await createSOR(tokenOut)
    return sor.getSwaps(tokenIn, tokenOut, swapType, new BigNumber(amount))
}
