import type { AugurSportsLinkMarketFactory } from '@masknet/contracts/types/AugurSportsLinkMarketFactory'
import type { AugurAMMFactory } from '@masknet/contracts/types/AugurAMMFactory'
import BigNumber from 'bignumber.js'
import type { AMMExchange, AMMOutcome, EstimateTradeResult } from '../types'
import { formatAmount, formatBalance, FungibleTokenDetailed } from '@masknet/web3-shared'
import { SWAP_FEE_DECIMALS } from '../constants'

const BONE = new BigNumber(10).pow(18)
const MIN_BPOW_BASE = new BigNumber(1)
const MAX_BPOW_BASE = BONE.multipliedBy(2).minus(1)
const BPOW_PRECISION = BONE.div(new BigNumber(10).pow(10))
export const MAX_OUT_RATIO = BONE.div(3).plus(1)
export const MAX_IN_RATIO = BONE.div(2)
export const MAX_UINT = new BigNumber(2).pow(256).minus(1)

function assert(condition: boolean, error: string) {
    if (!condition) {
        throw new Error(error)
    }
}

function btoi(a: BigNumber): BigNumber {
    return a.div(BONE)
}

function bfloor(a: BigNumber): BigNumber {
    return btoi(a.multipliedBy(BONE))
}

function badd(a: BigNumber, b: BigNumber): BigNumber {
    const c = a.plus(b)
    assert(c.gte(a), 'ERR_ADD_OVERFLOW')
    return c
}

function bsub(a: BigNumber, b: BigNumber): BigNumber {
    const [c, flag] = bsubSign(a, b)
    assert(!flag, 'ERR_SUB_UNDERFLOW')
    return c
}

function bsubSign(a: BigNumber, b: BigNumber): [BigNumber, boolean] {
    if (a.gte(b)) {
        return [a.minus(b), false]
    } else {
        return [b.minus(a), true]
    }
}

function bmul(a: BigNumber, b: BigNumber): BigNumber {
    const c0 = a.multipliedBy(b)
    assert(a.eq(0) || c0.div(a).eq(b), 'ERR_MUL_OVERFLOW')
    const c1 = c0.plus(BONE.div(2))
    assert(c1.gte(c0), 'ERR_MUL_OVERFLOW')
    return c1.div(BONE)
}

function bdiv(a: BigNumber, b: BigNumber): BigNumber {
    assert(!b.eq(0), 'ERR_DIV_ZERO')
    const c0 = a.multipliedBy(BONE)
    assert(a.eq(0) || c0.div(a).eq(BONE), 'ERR_DIV_INTERNAL') // bmul overflow
    const c1 = c0.plus(b.div(2))
    assert(c1.gte(c0), 'ERR_DIV_INTERNAL') //  badd assert
    return c1.div(b)
}

// DSMath.wpow
function bpowi(a: BigNumber, n: BigNumber): BigNumber {
    let z = n.mod(2).eq(0) ? BONE : a
    console.log('n', n.toString())

    n = n.div(2)
    while (n.isGreaterThanOrEqualTo(MIN_BPOW_BASE)) {
        a = bmul(a, a)

        if (!n.mod(2).eq(0)) {
            z = bmul(z, a)
        }
        n = n.div(2)
    }
    return z
}

// Compute b^(e.w) by splitting it into (b^e)*(b^0.w).
// Use `bpowi` for `b^e` and `bpowK` for k iterations
// of approximation of b^0.w
function bpow(base: BigNumber, exp: BigNumber): BigNumber {
    assert(base.gte(MIN_BPOW_BASE), 'ERR_BPOW_BASE_TOO_LOW')
    assert(base.lte(MAX_BPOW_BASE), 'ERR_BPOW_BASE_TOO_HIGH')

    const whole = bfloor(exp)
    const remain = bsub(exp, whole)

    const wholePow = bpowi(base, btoi(whole))

    if (!remain) {
        return wholePow
    }

    const partialResult = bpowApprox(base, remain, BPOW_PRECISION)
    return bmul(wholePow, partialResult)
}

function bpowApprox(base: BigNumber, exp: BigNumber, precision: BigNumber): BigNumber {
    // term 0:
    const a = exp
    const [x, xneg] = bsubSign(base, BONE)
    let term = BONE
    let sum = term
    let negative = false

    // term(k) = numer / denom
    //         = (product(a - i - 1, i=1-->k) * x^k) / (k!)
    // each iteration, multiply previous term by (a-(k-1)) * x / k
    // continue until term is less than precision
    for (let i = 1; term.gte(precision); i++) {
        const bigK = BONE.multipliedBy(i)
        const [c, cneg] = bsubSign(a, bsub(bigK, BONE))
        term = bmul(term, bmul(c, x))
        term = bdiv(term, bigK)
        if (term.eq(0)) break

        if (xneg) negative = !negative
        if (cneg) negative = !negative
        if (negative) {
            sum = bsub(sum, term)
        } else {
            sum = badd(sum, term)
        }
    }

    return sum
}

export function calcInGivenOut(
    tokenBalanceIn: BigNumber,
    tokenWeightIn: BigNumber,
    tokenBalanceOut: BigNumber,
    tokenWeightOut: BigNumber,
    tokenAmountOut: BigNumber,
    swapFee: BigNumber,
): BigNumber {
    const weightRatio = bdiv(tokenWeightOut, tokenWeightIn)
    const diff = bsub(tokenBalanceOut, tokenAmountOut)
    const y = bdiv(tokenBalanceOut, diff)
    const boo = bpow(y, weightRatio)
    const foo = bsub(boo, BONE)
    const tokenAmountIn = bsub(BONE, swapFee)
    return bdiv(bmul(tokenBalanceIn, foo), tokenAmountIn)
}

function calcOutGivenIn(
    tokenBalanceIn: BigNumber,
    tokenWeightIn: BigNumber,
    tokenBalanceOut: BigNumber,
    tokenWeightOut: BigNumber,
    tokenAmountIn: BigNumber,
    swapFee: BigNumber,
): BigNumber {
    const weightRatio = bdiv(tokenWeightIn, tokenWeightOut)
    let adjustedIn = bsub(BONE, swapFee)
    adjustedIn = bmul(tokenAmountIn, adjustedIn)
    const y = bdiv(tokenBalanceIn, badd(tokenBalanceIn, adjustedIn))
    const foo = bpow(y, weightRatio)
    const bar = bsub(BONE, foo)
    return bmul(tokenBalanceOut, bar)
}

function calcSpotPrice(
    tokenBalanceIn: BigNumber,
    tokenWeightIn: BigNumber,
    tokenBalanceOut: BigNumber,
    tokenWeightOut: BigNumber,
    swapFee: BigNumber,
): BigNumber {
    const numer = bdiv(tokenBalanceIn, tokenWeightIn)
    const denom = bdiv(tokenBalanceOut, tokenWeightOut)
    const ratio = bdiv(numer, denom)
    const scale = bdiv(BONE, bsub(BONE, swapFee))
    return bmul(ratio, scale)
}

function attemptTokenCalc(
    tokenAmountOut: BigNumber,
    _outcome: number,
    _tokenBalances: BigNumber[],
    _tokenWeights: BigNumber[],
    _swapFee: BigNumber,
): [BigNumber, BigNumber[]] {
    let runningBalance = _tokenBalances[_outcome]
    const tokensInPerOutcome = []
    let total = tokenAmountOut
    for (let i = 0; i < _tokenBalances.length; i++) {
        if (i === _outcome) {
            tokensInPerOutcome[i] = tokenAmountOut
            continue
        }
        const tokensInForToken = calcInGivenOut(
            runningBalance,
            _tokenWeights[_outcome],
            _tokenBalances[i],
            _tokenWeights[i],
            tokenAmountOut,
            _swapFee,
        )

        tokensInPerOutcome[i] = tokensInForToken

        total = total.plus(tokensInForToken)
        runningBalance = runningBalance.plus(tokensInForToken)
    }

    return [total, tokensInPerOutcome]
}

type calculateSellCompleteSetsResult = [setsOut: string, undesirableTokensInPerOutcome: string[]]
const TOLERANCE = new BigNumber(10).pow(10)

export function calcSellCompleteSets(
    _shareFactor: string,
    _outcome: number,
    _shareTokensIn: string,
    _tokenBalances: string[],
    _tokenWeights: string[],
    _swapFee: string,
): calculateSellCompleteSetsResult {
    return calculateSellCompleteSets(
        new BigNumber(_shareFactor),
        _outcome,
        new BigNumber(_shareTokensIn),
        _tokenBalances.map((t) => new BigNumber(t)),
        _tokenWeights.map((w) => new BigNumber(w)),
        new BigNumber(_swapFee),
    )
}

export function calculateSellCompleteSets(
    _shareFactor: BigNumber,
    _outcome: number,
    _shareTokensIn: BigNumber,
    _tokenBalances: BigNumber[],
    _tokenWeights: BigNumber[],
    _swapFee: BigNumber,
): calculateSellCompleteSetsResult {
    let lower = new BigNumber(0)
    let upper = _shareTokensIn
    let tokenAmountOut = upper.minus(lower).div(2).plus(lower)
    let tokensInPerOutcome: string[] = []
    const limit = 256
    let counter = 0
    while (!tokenAmountOut.eq(0) && counter <= limit) {
        try {
            for (let i = 0; i < _tokenBalances.length; i++) {
                if (i === _outcome) continue
                assert(tokenAmountOut.lte(bmul(_tokenBalances[i], MAX_OUT_RATIO)), 'ERR_MAX_OUT_RATIO')
            }

            // Using the formula total = a_1 + a_2 + ... + c
            const [total, _tokensInPerOutcome] = attemptTokenCalc(
                tokenAmountOut,
                _outcome,
                _tokenBalances,
                _tokenWeights,
                _swapFee,
            )
            tokensInPerOutcome = _tokensInPerOutcome.map((m) => m.toString())

            if (
                (_shareTokensIn.minus(total).abs().lte(TOLERANCE) && _shareTokensIn.gt(total)) ||
                upper.minus(lower).lt(2)
            ) {
                break
            }

            if (total.gt(_shareTokensIn)) {
                upper = tokenAmountOut
            } else {
                lower = tokenAmountOut
            }

            // Find mid-point of the new upper/lower bounds.
            tokenAmountOut = upper.minus(lower).div(2).plus(lower)
        } catch (e) {
            // On error we go lower.
            upper = tokenAmountOut
            tokenAmountOut = upper.minus(lower).div(2).plus(lower)
        }
        counter++
    }

    return [tokenAmountOut.div(_shareFactor).multipliedBy(_shareFactor).toString(), tokensInPerOutcome]
}

export async function calculateSellCompleteSetsWithValues(
    _ammFactory: AugurAMMFactory,
    _marketFactory: AugurSportsLinkMarketFactory,
    _marketId: string,
    _outcome: number,
    _shareTokensIn: string,
): Promise<[setsOut: string, undesirableTokensInPerOutcome: string[]]> {
    return calculateSellCompleteSets(
        new BigNumber(await _marketFactory.methods.shareFactor().call()),
        _outcome,
        new BigNumber(_shareTokensIn),
        (await _ammFactory.methods.getPoolBalances(_marketFactory.options.address, _marketId).call()).map(
            (x) => new BigNumber(x),
        ),
        (await _ammFactory.methods.getPoolWeights(_marketFactory.options.address, _marketId).call()).map(
            (x) => new BigNumber(x),
        ),
        new BigNumber(await _ammFactory.methods.getSwapFee(_marketFactory.options.address, _marketId).call()),
    )
}

function swapExactAmountIn(
    tokenAmountIn: BigNumber,
    minAmountOut: BigNumber,
    maxPrice: BigNumber,
    inTokenBalance: BigNumber,
    inTokenWeight: BigNumber,
    outTokenBalance: BigNumber,
    outTokenWeight: BigNumber,
    _swapFee: BigNumber,
): [tokenAmountOut: BigNumber, spotPriceAfter: BigNumber] {
    console.log('in balance', inTokenBalance.toString())
    console.log('max ratio', MAX_IN_RATIO.toString())
    console.log('in amount', tokenAmountIn.toString())
    console.log('mul', bmul(inTokenBalance, MAX_IN_RATIO).toString())
    assert(tokenAmountIn.lte(bmul(inTokenBalance, MAX_IN_RATIO)), 'ERR_MAX_IN_RATIO')

    const spotPriceBefore = calcSpotPrice(inTokenBalance, inTokenWeight, outTokenBalance, outTokenWeight, _swapFee)
    assert(spotPriceBefore.lte(maxPrice), 'ERR_BAD_LIMIT_PRICE')

    const tokenAmountOut = calcOutGivenIn(
        inTokenBalance,
        inTokenWeight,
        outTokenBalance,
        outTokenWeight,
        tokenAmountIn,
        _swapFee,
    )
    assert(tokenAmountOut.gte(minAmountOut), 'ERR_LIMIT_OUT')

    inTokenBalance = badd(inTokenBalance, tokenAmountIn)
    outTokenBalance = bsub(outTokenBalance, tokenAmountOut)

    const spotPriceAfter = calcSpotPrice(inTokenBalance, inTokenWeight, outTokenBalance, outTokenWeight, _swapFee)
    console.log('spotPriceBefore', spotPriceBefore.toString())
    console.log('spotPriceAfter', spotPriceAfter.toString())
    console.log('in amount', tokenAmountIn.toString())
    console.log('out amount', tokenAmountOut.toString())
    console.log('in balance', inTokenBalance.toString())
    console.log('out balance', outTokenBalance.toString())
    console.log('inTokenWeight', inTokenWeight.toString())
    console.log('outTokenWeight', outTokenWeight.toString())
    console.log('ratio', bdiv(tokenAmountIn, tokenAmountOut).toString())

    assert(spotPriceAfter.gte(spotPriceBefore), 'ERR_MATH_APPROX')
    assert(spotPriceAfter.lte(maxPrice), 'ERR_LIMIT_PRICE')
    // assert(spotPriceBefore.lte(bdiv(tokenAmountIn, tokenAmountOut)), 'ERR_MATH_APPROX')

    return [tokenAmountOut, spotPriceAfter]
}

export function estimateBuy(
    _shareFactor: string,
    _outcome: number,
    _collateralIn: string,
    _tokenBalances: string[],
    _tokenWeights: string[],
    _swapFee: string,
): string {
    const tokenBalances = _tokenBalances.map((b) => new BigNumber(b))
    const tokenWeights = _tokenWeights.map((w) => new BigNumber(w))

    const result = buy(
        new BigNumber(_shareFactor),
        _outcome,
        new BigNumber(_collateralIn),
        tokenBalances,
        tokenWeights,
        new BigNumber(_swapFee),
    )
    return result.toString()
}

function buy(
    _shareFactor: BigNumber,
    _outcome: number,
    _collateralIn: BigNumber,
    _tokenBalances: BigNumber[],
    _tokenWeights: BigNumber[],
    _swapFee: BigNumber,
): BigNumber {
    const _sets = _collateralIn.multipliedBy(_shareFactor)
    let _totalDesiredOutcome = _sets
    let _runningBalance = new BigNumber(0)

    for (let i = 0; i < _tokenBalances.length; i++) {
        if (i == _outcome) continue

        try {
            const [_acquiredToken] = swapExactAmountIn(
                _sets,
                new BigNumber(0),
                MAX_UINT,
                _tokenBalances[i],
                _tokenWeights[i],
                _tokenBalances[_outcome].minus(_runningBalance),
                _tokenWeights[_outcome],
                _swapFee,
            )

            _totalDesiredOutcome = _totalDesiredOutcome.plus(_acquiredToken)
            _runningBalance = _runningBalance.plus(_acquiredToken)
            console.log(i)
        } catch (e) {
            console.log(e)
        }
    }

    return _totalDesiredOutcome
}

export async function buyWithValues(
    _ammFactory: AugurAMMFactory,
    _marketFactory: AugurSportsLinkMarketFactory,
    _marketId: number,
    _outcome: number,
    _shareTokensIn: string,
): Promise<string> {
    return buy(
        new BigNumber(await _marketFactory.methods.shareFactor().call()),
        _outcome,
        new BigNumber(_shareTokensIn),
        (await _ammFactory.methods.getPoolBalances(_marketFactory.options.address, _marketId).call()).map(
            (x) => new BigNumber(x),
        ),
        (await _ammFactory.methods.getPoolWeights(_marketFactory.options.address, _marketId).call()).map(
            (x) => new BigNumber(x),
        ),
        new BigNumber(await _ammFactory.methods.getSwapFee(_marketFactory.options.address, _marketId).call()),
    ).toString()
}

export const estimateBuyTrade = (
    amm: AMMExchange,
    inputDisplayAmount: string,
    outcome: AMMOutcome,
    fee: string,
    cash: FungibleTokenDetailed,
    shareDecimals: number,
): EstimateTradeResult | undefined => {
    if (!new BigNumber(inputDisplayAmount).isGreaterThan(0)) return

    let result
    const amount = formatAmount(inputDisplayAmount, cash.decimals)

    try {
        result = estimateBuy(amm.shareFactor, outcome.id, amount, amm.balances, amm.weights, '0')
    } catch (e) {
        if (!result) return
    }

    const decimalFee = formatBalance(fee, SWAP_FEE_DECIMALS)
    const estimatedShares = formatBalance(result, shareDecimals)
    const tradeFees = new BigNumber(inputDisplayAmount).times(new BigNumber(decimalFee)).toString()
    const averagePrice = new BigNumber(inputDisplayAmount).div(new BigNumber(estimatedShares))
    const maxProfit = new BigNumber(estimatedShares).minus(new BigNumber(inputDisplayAmount)).toString()
    const price = new BigNumber(outcome.rate)
    const priceImpact = price.minus(averagePrice).dividedBy(price).times(100).toFixed(4)
    const ratePerCash = new BigNumber(estimatedShares).div(new BigNumber(inputDisplayAmount)).toFixed(6)

    return {
        outputValue: estimatedShares,
        tradeFees,
        averagePrice: averagePrice.toFixed(4),
        maxProfit,
        ratePerCash,
        priceImpact,
    }
}
