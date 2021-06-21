import BigNumber from 'bignumber.js'
import {
    Token as UniswapToken,
    ChainId as UniswapChainId,
    Currency as UniswapCurrency,
    CurrencyAmount as UniswapCurrencyAmount,
    Percent as UniswapPercent,
    Price as UniswapPrice,
    JSBI,
    TokenAmount,
} from '@uniswap/sdk'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { ChainId, EthereumTokenType, FungibleTokenDetailed, isNative } from '@dimensiondev/web3-shared'
import { WETH } from '../constants'

export function toUniswapChainId(chainId: ChainId): UniswapChainId {
    return chainId as unknown as UniswapChainId
}

export function toUniswapPercent(numerator: number, denominator: number) {
    return new UniswapPercent(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
}

export function toUniswapCurrency(chainId: ChainId, token: FungibleTokenDetailed): UniswapCurrency {
    return toUniswapToken(chainId, token)
}

export function toUniswapToken(chainId: ChainId, token: FungibleTokenDetailed): UniswapToken {
    return new UniswapToken(
        toUniswapChainId(chainId),
        formatEthereumAddress(token.address),
        token.decimals,
        token.symbol,
        token.name,
    )
}

export function toUniswapCurrencyAmount(chainId: ChainId, token: FungibleTokenDetailed, amount: string) {
    return new TokenAmount(
        toUniswapToken(chainId, isNative(token.address) ? WETH[chainId] : token),
        JSBI.BigInt(amount),
    )
}

export function uniswapChainIdTo(chainId: UniswapChainId) {
    return chainId as unknown as ChainId
}

export function uniswapPercentTo(percent: UniswapPercent) {
    return new BigNumber(percent.numerator.toString()).dividedBy(percent.denominator.toString())
}

export function uniswapPriceTo(price: UniswapPrice) {
    return new BigNumber(price.scalar.numerator.toString()).dividedBy(price.scalar.denominator.toString())
}

export function uniswapTokenTo(token: UniswapToken) {
    return {
        type: ['eth', 'matic', 'bnb'].includes(token.name?.toLowerCase() ?? '')
            ? EthereumTokenType.Native
            : EthereumTokenType.ERC20,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: formatEthereumAddress(token.address),
        chainId: uniswapChainIdTo(token.chainId),
    } as FungibleTokenDetailed
}

export function uniswapCurrencyAmountTo(currencyAmount: UniswapCurrencyAmount) {
    return new BigNumber(currencyAmount.raw.toString())
}
