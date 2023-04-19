import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType, isGreaterThan, isSameAddress, pow10 } from '@masknet/web3-shared-base'
import { type ChainId, WNATIVE, SchemaType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { type Currency, Ether, Token, CurrencyAmount, Percent, Fraction, type Price } from '@uniswap/sdk-core'
import { memoize } from 'lodash-es'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade } from '../types.js'
import { INPUT_FRACTION_AFTER_FEE, ONE_HUNDRED_PERCENT } from '../constants.js'
import { BigNumber } from 'bignumber.js'

export function toUniswapChainId(chainId: ChainId) {
    return chainId as number
}

export function toUniswapToken(chainId: ChainId, token: Web3Helper.FungibleTokenAll) {
    return new Token(
        toUniswapChainId(chainId),
        formatEthereumAddress(token.address),
        token.decimals,
        token.symbol,
        token.name,
    )
}

export function toUniswapCurrencyAmount(chainId?: ChainId, token?: Web3Helper.FungibleTokenAll, amount?: string) {
    if (!token || !amount || !chainId) return
    const currency = toUniswapCurrency(chainId, token)
    if (!currency) return
    try {
        if (isGreaterThan(amount, 0)) return CurrencyAmount.fromRawAmount(currency, amount)
    } catch {
        return
    }
    return
}

const wrapEtherMemo = memoize((chainId: ChainId) => toUniswapToken(chainId, WNATIVE[chainId]))

export class ExtendedEther extends Ether {
    public override get wrapped(): Token {
        if (this.chainId in WNATIVE) return ExtendedEther.wrapEther(this.chainId)
        throw new Error('Unsupported chain ID')
    }

    private static _cachedEther: Record<number, ExtendedEther> = {}

    public static override onChain(chainId: number): ExtendedEther {
        return this._cachedEther[chainId] ?? (this._cachedEther[chainId] = new ExtendedEther(chainId))
    }

    public static wrapEther: (chainID: ChainId) => Token = wrapEtherMemo
}

export function toUniswapCurrency(chainId?: ChainId, token?: Web3Helper.FungibleTokenAll): Currency | undefined {
    try {
        if (!token || !chainId) return
        const extendedEther = ExtendedEther.onChain(chainId)
        const weth = toUniswapToken(chainId, WNATIVE[chainId])
        if (weth && isSameAddress(token.address, weth.address)) return weth
        return token.schema === SchemaType.Native ? extendedEther : toUniswapToken(chainId, token)
    } catch {
        return
    }
}

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(trade: Trade): Percent {
    if (trade instanceof V2Trade) {
        // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
        // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
        const percent = ONE_HUNDRED_PERCENT.subtract(
            trade.route.pairs.reduce<Percent>(
                (currentFee: Percent): Percent => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                ONE_HUNDRED_PERCENT,
            ),
        )
        return new Percent(percent.numerator, percent.denominator)
    } else {
        const percent = ONE_HUNDRED_PERCENT.subtract(
            trade.route.pools.reduce<Percent>(
                (currentFee: Percent, pool): Percent =>
                    currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(pool.fee, 1000000))),
                ONE_HUNDRED_PERCENT,
            ),
        )
        return new Percent(percent.numerator, percent.denominator)
    }
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(trade?: Trade | null): CurrencyAmount<Currency> | undefined {
    try {
        if (trade) {
            const realizedLPFee = computeRealizedLPFeePercent(trade)

            // the amount of the input that accrues to LPs
            return CurrencyAmount.fromRawAmount(
                trade.inputAmount.currency,
                trade.inputAmount.multiply(realizedLPFee).quotient,
            )
        }
        return undefined
    } catch {
        return undefined
    }
}

export function uniswapCurrencyAmountTo(currencyAmount: CurrencyAmount<Currency>) {
    return pow10(currencyAmount.currency.decimals).multipliedBy(currencyAmount.toFixed())
}

export function uniswapPriceTo(price: Price<Currency, Currency>) {
    return new BigNumber(price.scalar.numerator.toString()).dividedBy(price.scalar.denominator.toString())
}

export function uniswapPercentTo(percent: Percent) {
    return new BigNumber(percent.toFixed(2)).dividedBy(100)
}

export function uniswapChainIdTo(chainId: number) {
    return chainId as ChainId
}

export function uniswapTokenTo(token: Token) {
    return {
        type: TokenType.Fungible,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: formatEthereumAddress(token.address),
        chainId: uniswapChainIdTo(token.chainId),
        schema: ['eth', 'matic', 'bnb'].includes(token.name?.toLowerCase() ?? '')
            ? SchemaType.Native
            : SchemaType.ERC20,
        id: token.symbol,
    } as Web3Helper.FungibleTokenAll
}
