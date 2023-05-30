import { memoize } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { TradeProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType, isGreaterThan, isSameAddress, pow10 } from '@masknet/web3-shared-base'
import { type ChainId, WNATIVE, SchemaType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { type Currency, Ether, Token, CurrencyAmount, Percent, Fraction, type Price } from '@uniswap/sdk-core'
import { Trade as V2Trade, Router } from '@uniswap/v2-sdk'
import { Route, type Pool } from '@uniswap/v3-sdk'
import type { Trade } from '../../types/Trader.js'
import { INPUT_FRACTION_AFTER_FEE, ONE_HUNDRED_PERCENT } from '../constants/index.js'

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

export function toUniswapPercent(numerator: number, denominator: number) {
    return new Percent(numerator, denominator)
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

// Pangolin and TraderJoe have modified uniswap contracts
type SwapParams = Parameters<typeof Router.swapCallParameters>
export const swapCallParameters = (trade: SwapParams[0], options: SwapParams[1], tradeProvider?: TradeProvider) => {
    const parameters = Router.swapCallParameters(trade, options)
    if (tradeProvider === TradeProvider.PANGOLIN || tradeProvider === TradeProvider.TRADERJOE) {
        switch (parameters.methodName) {
            case 'WETH':
                parameters.methodName = 'WAVAX'
                break
            case 'swapTokensForExactETH':
                parameters.methodName = 'swapTokensForExactAVAX'
                break
            case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                /* cspell:disable-next-line */
                parameters.methodName = 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
                break
            case 'swapExactTokensForETH':
                parameters.methodName = 'swapExactTokensForAVAX'
                break
            case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                /* cspell:disable-next-line */
                parameters.methodName = 'swapExactAVAXForTokensSupportingFeeOnTransferTokens'
                break
            case 'swapExactETHForTokens':
                parameters.methodName = 'swapExactAVAXForTokens'
                break
        }
    }
    return parameters
}

export function swapErrorToUserReadableMessage(error: any): string {
    let reason: string | undefined
    while (error) {
        reason = error.reason ?? error.message ?? reason
        error = error.error ?? error.data?.originalError
    }

    if (reason?.startsWith('execution reverted: ')) reason = reason.slice('execution reverted: '.length)

    switch (reason) {
        case 'UniswapV2Router: EXPIRED':
            return 'The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.'
        case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
        case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
            return 'This transaction will not succeed either due to price movement or fee on transfer.'
        case 'TransferHelper: TRANSFER_FROM_FAILED':
            return 'The input token cannot be transferred. There may be an issue with the input token.'
        case 'UniswapV2: TRANSFER_FAILED':
            return 'The output token cannot be transferred. There may be an issue with the output token.'
        case 'UniswapV2: K':
            return 'The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.'
        case 'Too little received':
        case 'Too much requested':
        case 'STF':
            return 'This transaction will not succeed due to price movement.'
        case 'TF':
            return 'The output token cannot be transferred. There may be an issue with the output token.'
        default:
            if (reason?.includes('undefined is not an object')) {
                console.error(error, reason)
                return 'An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.'
            }
            return `Unknown error${reason ? `: "${reason}"` : ''}.`
    }
}

export function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    allPaths: Array<Route<Currency, Currency>> = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2,
): Array<Route<Currency, Currency>> {
    const tokenIn = currencyIn?.wrapped
    const tokenOut = currencyOut?.wrapped
    if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')

    try {
        for (const pool of pools) {
            if (currentPath.includes(pool) || !pool.involvesToken(tokenIn)) continue

            const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0
            if (outputToken.equals(tokenOut)) {
                allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut))
            } else if (maxHops > 1) {
                computeAllRoutes(
                    outputToken,
                    currencyOut,
                    pools,
                    chainId,
                    [...currentPath, pool],
                    allPaths,
                    startCurrencyIn,
                    maxHops - 1,
                )
            }
        }
    } catch {
        return []
    }

    return allPaths
}
