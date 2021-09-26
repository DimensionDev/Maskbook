import JSBI from 'jsbi'
import { memoize } from 'lodash-es'
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
    isGreaterThan,
} from '@masknet/web3-shared'
import { ONE_HUNDRED_PERCENT, WNATIVE, ZERO_PERCENT } from '../constants'

export function swapErrorToUserReadableMessage(error: any): string {
    let reason: string | undefined
    while (Boolean(error)) {
        reason = error.reason ?? error.message ?? reason
        error = error.error ?? error.data?.originalError
    }

    if (reason?.startsWith('execution reverted: ')) reason = reason.substr('execution reverted: '.length)

    switch (reason) {
        case 'UniswapV2Router: EXPIRED':
            return `The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.`
        case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
        case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
            return `This transaction will not succeed either due to price movement or fee on transfer.`
        case 'TransferHelper: TRANSFER_FROM_FAILED':
            return `The input token cannot be transferred. There may be an issue with the input token.`
        case 'UniswapV2: TRANSFER_FAILED':
            return `The output token cannot be transferred. There may be an issue with the output token.`
        case 'UniswapV2: K':
            return `The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.`
        case 'Too little received':
        case 'Too much requested':
        case 'STF':
            return `This transaction will not succeed due to price movement.`
        case 'TF':
            return `The output token cannot be transferred. There may be an issue with the output token.`
        default:
            if (reason?.includes('undefined is not an object')) {
                console.error(error, reason)
                return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.`
            }
            return `Unknown error${reason ? `: "${reason}"` : ''}.`
    }
}

export function toUniswapChainId(chainId: ChainId) {
    return chainId as number
}

export function toUniswapPercent(numerator: number, denominator: number) {
    return new Percent(JSBI.BigInt(numerator), JSBI.BigInt(denominator))
}

export function toUniswapCurrency(chainId: ChainId, token?: FungibleTokenDetailed): Currency | undefined {
    if (!token) return
    const extendedEther = ExtendedEther.onChain(chainId)
    const weth = toUniswapToken(chainId, WNATIVE[chainId])
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
    if (isGreaterThan(amount, 0)) return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(amount))
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
    public override get wrapped(): Token {
        if (this.chainId in WNATIVE) return ExtendedEther.wrapEther(this.chainId)
        throw new Error('Unsupported chain ID')
    }

    private static _cachedEther: Record<number, ExtendedEther> = {}

    public static override onChain(chainId: number): ExtendedEther {
        return this._cachedEther[chainId] ?? (this._cachedEther[chainId] = new ExtendedEther(chainId))
    }

    public static wrapEther: (chainID: ChainId) => Token = memoize((chainId: ChainId) =>
        toUniswapToken(chainId, WNATIVE[chainId]),
    )
}
