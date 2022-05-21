import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    createContract,
    ChainId,
    getERC20TokenDetailed,
    ERC20TokenDetailed,
    FungibleToken,
    FungibleTokenDetailed,
    getTraderConstants,
} from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import type { Pair } from '@masknet/web3-contracts/types/Pair'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { Pair as UniswapPair } from '@uniswap/v2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'
import { getPairAddress } from '../../../Trader/helpers/pair'

export async function getPriceFromTrisolaris(
    token0: ERC20TokenDetailed,
    token1: ERC20TokenDetailed,
    priceToken: ERC20TokenDetailed,
    web3: Web3,
) {
    const DEX_TRADE = getTraderConstants(ChainId.Aurora)
    if (!DEX_TRADE.TRISOLARIS_FACTORY_ADDRESS || !DEX_TRADE.TRISOLARIS_INIT_CODE_HASH) return ZERO
    const tokenA = new Token(ChainId.Aurora, token0.address, token0.decimals, token0.symbol, token0.name)
    const tokenB = new Token(ChainId.Aurora, token1.address, token1.decimals, token1.symbol, token1.name)
    const priceOfToken = new Token(
        ChainId.Aurora,
        priceToken.address,
        priceToken.decimals,
        priceToken.symbol,
        priceToken.name,
    )
    const pairAddress = getPairAddress(
        DEX_TRADE.TRISOLARIS_FACTORY_ADDRESS,
        DEX_TRADE.TRISOLARIS_INIT_CODE_HASH,
        tokenA,
        tokenB,
    )
    return getUniswapV2PairPrice(pairAddress, tokenA, tokenB, priceOfToken, web3)
}

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

export function splitToPair(a: FungibleTokenDetailed[] | undefined) {
    if (!a) {
        return []
    }
    const pairs: FungibleTokenDetailed[][] = []
    a.forEach((value, index) => {
        if (index % 2 === 0) {
            pairs.push(a.slice(index, index + 2))
        }
    })
    return pairs
}

export async function getFungibleTokensDetailed(
    allTokens: Array<Pick<FungibleToken, 'address'>>,
    web3: Web3,
    chainId: ChainId,
) {
    return Promise.all(
        allTokens.map(async (token, i) => {
            const erc20TokenContract = createContract<ERC20>(web3, token.address, ERC20ABI as AbiItem[])
            const erc20TokenBytes32Contract = createContract<ERC20Bytes32>(
                web3,
                token.address,
                ERC20Bytes32ABI as AbiItem[],
            )
            return getERC20TokenDetailed(
                token.address,
                chainId,
                erc20TokenContract,
                erc20TokenBytes32Contract,
                token as Partial<ERC20TokenDetailed>,
            )
        }),
    )
}
