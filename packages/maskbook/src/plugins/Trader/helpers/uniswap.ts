import JSBI from 'jsbi'
import BigNumber from 'bignumber.js'
import { Currency, Token, CurrencyAmount, TradeType, Percent, Price, Ether } from '@uniswap/sdk-core'
import type { Trade } from '@uniswap/v2-sdk'
import {
    formatEthereumAddress,
    pow10,
    ChainId,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
} from '@masknet/web3-shared'
import { ONE_HUNDRED_PERCENT, WETH, ZERO_PERCENT } from '../constants'

export function toUniswapChainId(chainId: ChainId) {
    return chainId as number
}

export function toUniswapPercent(numerator: number, denominator: number) {
    return new Percent(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
}

export function toUniswapCurrency(chainId: ChainId, token?: FungibleTokenDetailed): Currency | undefined {
    if (!token) return
    const extendedEther = ExtendedEther.onChain(chainId)
    const weth = toUniswapToken(chainId, WETH[chainId])
    if (weth && isSameAddress(token.address, weth.address)) return weth
    return token.type === EthereumTokenType.Native ? extendedEther : toUniswapToken(chainId, token)
}

export function toUniswapToken(chainId: ChainId, token: FungibleTokenDetailed) {
    return new Token(
        toUniswapChainId(chainId),
        formatEthereumAddress(token.address),
        token.decimals,
        token.symbol,
        token.name,
    )
}

export function toUniswapCurrencyAmount(chainId: ChainId, token?: FungibleTokenDetailed, amount?: string) {
    if (!token || !amount) return
    const currency = toUniswapCurrency(chainId, token)
    if (!currency) return
    if (amount !== '0') return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(amount))
    return
}

export function uniswapChainIdTo(chainId: number) {
    return chainId as ChainId
}

export function uniswapPercentTo(percent: Percent) {
    return new BigNumber(percent.toFixed(2)).dividedBy(100)
}

export function uniswapPriceTo(price: Price<Currency, Currency>) {
    return new BigNumber(price.scalar.numerator.toString()).dividedBy(price.scalar.denominator.toString())
}

export function uniswapTokenTo(token: Token) {
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

export function uniswapCurrencyAmountTo(currencyAmount: CurrencyAmount<Currency>) {
    return pow10(currencyAmount.currency.decimals).multipliedBy(currencyAmount.toFixed())
}

export function isTradeBetter(
    tradeA?: Trade<Currency, Currency, TradeType> | null,
    tradeB?: Trade<Currency, Currency, TradeType> | null,
    minimumDelta: Percent = ZERO_PERCENT,
): boolean | undefined {
    if (tradeA && !tradeB) return false
    if (tradeB && !tradeA) return true
    if (!tradeA || !tradeB) return undefined

    if (
        tradeA.tradeType !== tradeB.tradeType ||
        !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
        !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
    ) {
        throw new Error('Comparing incomparable trades')
    }

    if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA.executionPrice.lessThan(tradeB.executionPrice)
    } else {
        return tradeA.executionPrice.asFraction
            .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
            .lessThan(tradeB.executionPrice)
    }
}

export class ExtendedEther extends Ether {
    public get wrapped(): Token {
        if (this.chainId in WETH) return toUniswapToken(this.chainId, WETH[this.chainId as ChainId])
        throw new Error('Unsupported chain ID')
    }

    private static _cachedEther: { [chainId: number]: ExtendedEther } = {}

    public static onChain(chainId: number): ExtendedEther {
        return this._cachedEther[chainId] ?? (this._cachedEther[chainId] = new ExtendedEther(chainId))
    }
}
