import { ChainId, createContract } from '@masknet/web3-shared-evm'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

import { Pair as UniswapPair } from '@uniswap/v2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import type { Pair } from '@masknet/web3-contracts/types/Pair'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import BigNumber from 'bignumber.js'

export async function getUniswapV2PairPrice(
    pairAddress: string,
    token0: Token,
    token1: Token,
    priceToken: Token,
    web3: Web3,
) {
    const pair = createContract<Pair>(web3, pairAddress, PairABI as AbiItem[])
    const [reserves] = await Promise.all([pair?.methods.getReserves().call()])
    if (!reserves) return null

    const uniPair = new UniswapPair(
        CurrencyAmount.fromRawAmount(token0, reserves._reserve0),
        CurrencyAmount.fromRawAmount(token1, reserves._reserve1),
    )
    const paddingDecimalsLimit = 18
    const pricePaddingDecimals =
        token0.decimals < paddingDecimalsLimit || token1.decimals < paddingDecimalsLimit
            ? paddingDecimalsLimit - token1.decimals + token0.decimals
            : 0
    const curPrice = new BigNumber(
        (priceToken.symbol === token0.symbol ? uniPair.token0Price : uniPair.token1Price).toSignificant(10),
    ).shiftedBy(pricePaddingDecimals)
    return curPrice
}

export async function getFungibleTokensDetailed(
    allTokens: string[],
    connection: Web3Helper.Web3ConnectionScope,
    chainId: ChainId,
): Promise<Array<Web3Helper.FungibleTokenScope<'all', NetworkPluginID>>> {
    return Promise.all(
        allTokens.map(async (address, i) => {
            return connection.getFungibleToken?.(address ?? '', {
                chainId,
            })
        }),
    )
}
