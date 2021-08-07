// https://github.com/AugurProject/turbo/blob/787f988393b531ac49fa1db2d4b5ed18951784fb/packages/smart/src/bmath.ts

import { BigNumber } from 'ethers'

const BONE = BigNumber.from(10).pow(18)
const MIN_BPOW_BASE = BigNumber.from(1)
const MAX_BPOW_BASE = BONE.mul(2).sub(1)
const BPOW_PRECISION = BONE.div(BigNumber.from(10).pow(10))
export const MAX_OUT_RATIO = BONE.div(3).add(1)
export const MAX_IN_RATIO = BONE.div(2)
export const MAX_UINT = BigNumber.from(2).pow(256).sub(1)

function assert(condition: boolean, error: string) {
    if (!condition) {
        throw new Error(error)
    }
}

function btoi(a: BigNumber): BigNumber {
    return a.div(BONE)
}

function bfloor(a: BigNumber): BigNumber {
    return btoi(a).mul(BONE)
}

function badd(a: BigNumber, b: BigNumber): BigNumber {
    const c = a.add(b)
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
        return [a.sub(b), false]
    } else {
        return [b.sub(a), true]
    }
}

function bmul(a: BigNumber, b: BigNumber): BigNumber {
    const c0 = a.mul(b)
    assert(a.eq(0) || c0.div(a).eq(b), 'ERR_MUL_OVERFLOW')
    const c1 = c0.add(BONE.div(2))
    assert(c1.gte(c0), 'ERR_MUL_OVERFLOW')
    return c1.div(BONE)
}

function bdiv(a: BigNumber, b: BigNumber): BigNumber {
    assert(!b.eq(0), 'ERR_DIV_ZERO')
    const c0 = a.mul(BONE)
    assert(a.eq(0) || c0.div(a).eq(BONE), 'ERR_DIV_INTERNAL') // bmul overflow
    const c1 = c0.add(b.div(2))
    assert(c1.gte(c0), 'ERR_DIV_INTERNAL') //  badd assert
    return c1.div(b)
}

// DSMath.wpow
function bpowi(a: BigNumber, n: BigNumber): BigNumber {
    let z = n.mod(2).eq(0) ? BONE : a

    n = n.div(2)
    while (!n.eq(0)) {
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

    if (remain.eq(0)) {
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
        const bigK = BONE.mul(i)
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

        total = total.add(tokensInForToken)
        runningBalance = runningBalance.add(tokensInForToken)
    }

    return [total, tokensInPerOutcome]
}

type calculateSellCompleteSetsResult = [setsOut: string, undesirableTokensInPerOutcome: string[]]
const TOLERANCE = BigNumber.from(10).pow(10)

export function calcSellCompleteSets(
    _shareFactor: string,
    _outcome: number,
    _shareTokensIn: string,
    _tokenBalances: string[],
    _tokenWeights: string[],
    _swapFee: string,
): calculateSellCompleteSetsResult {
    return calculateSellCompleteSets(
        BigNumber.from(_shareFactor),
        _outcome,
        BigNumber.from(_shareTokensIn),
        _tokenBalances.map((t) => BigNumber.from(t)),
        _tokenWeights.map((w) => BigNumber.from(w)),
        BigNumber.from(_swapFee),
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
    let lower = BigNumber.from(0)
    let upper = _shareTokensIn
    let tokenAmountOut = upper.sub(lower).div(2).add(lower)
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
                (_shareTokensIn.sub(total).abs().lte(TOLERANCE) && _shareTokensIn.gt(total)) ||
                upper.sub(lower).lt(2)
            ) {
                break
            }

            if (total.gt(_shareTokensIn)) {
                upper = tokenAmountOut
            } else {
                lower = tokenAmountOut
            }

            // Find mid-point of the new upper/lower bounds.
            tokenAmountOut = upper.sub(lower).div(2).add(lower)
        } catch (e) {
            // On error we go lower.
            upper = tokenAmountOut
            tokenAmountOut = upper.sub(lower).div(2).add(lower)
        }
        counter++
    }

    return [tokenAmountOut.div(_shareFactor).mul(_shareFactor).toString(), tokensInPerOutcome]
}

// export async function calculateSellCompleteSetsWithValues(
//   _ammFactory: AMMFactory,
//   _marketFactory: AbstractMarketFactoryV2,
//   _marketId: string,
//   _outcome: number,
//   _shareTokensIn: string
// ): Promise<[setsOut: string, undesirableTokensInPerOutcome: string[]]> {
//   return calculateSellCompleteSets(
//     await _marketFactory.shareFactor(),
//     _outcome,
//     BigNumber.from(_shareTokensIn),
//     await _ammFactory.getPoolBalances(_marketFactory.address, _marketId),
//     await _ammFactory.getPoolWeights(_marketFactory.address, _marketId),
//     await _ammFactory.getSwapFee(_marketFactory.address, _marketId)
//   );
// }

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
    assert(spotPriceAfter.gte(spotPriceBefore), 'ERR_MATH_APPROX')
    assert(spotPriceAfter.lte(maxPrice), 'ERR_LIMIT_PRICE')
    assert(spotPriceBefore.lte(bdiv(tokenAmountIn, tokenAmountOut)), 'ERR_MATH_APPROX')

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
    const tokenBalances = _tokenBalances.map((b) => BigNumber.from(b))
    const tokenWeights = _tokenWeights.map((w) => BigNumber.from(w))
    const result = buy(
        BigNumber.from(_shareFactor),
        _outcome,
        BigNumber.from(_collateralIn),
        tokenBalances,
        tokenWeights,
        BigNumber.from(_swapFee),
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
    const _sets = _collateralIn.mul(_shareFactor)
    let _totalDesiredOutcome = _sets
    let _runningBalance = BigNumber.from(0)

    for (let i = 0; i < _tokenBalances.length; i++) {
        if (i == _outcome) continue
        const [_acquiredToken] = swapExactAmountIn(
            _sets,
            BigNumber.from(0),
            MAX_UINT,
            _tokenBalances[i],
            _tokenWeights[i],
            _tokenBalances[_outcome].sub(_runningBalance),
            _tokenWeights[_outcome],
            _swapFee,
        )
        _totalDesiredOutcome = _totalDesiredOutcome.add(_acquiredToken)
        _runningBalance = _runningBalance.add(_acquiredToken)
    }

    return _totalDesiredOutcome
}

// export async function buyWithValues(
//     _ammFactory: AugurAMMFactory,
//     _marketFactory: AugurSportsLinkMarketFactory,
//     _marketId: number,
//     _outcome: number,
//     _shareTokensIn: string,
// ): Promise<string> {
//     return buy(
//         BigNumber(await _marketFactory.methods.shareFactor().call()),
//         _outcome,
//         new BigNumber(_shareTokensIn),
//         (await _ammFactory.methods.getPoolBalances(_marketFactory.options.address, _marketId).call()).map(
//             (x) => new BigNumber(x),
//         ),
//         (await _ammFactory.methods.getPoolWeights(_marketFactory.options.address, _marketId).call()).map(
//             (x) => new BigNumber(x),
//         ),
//         new BigNumber(await _ammFactory.methods.getSwapFee(_marketFactory.options.address, _marketId).call()),
//     ).toString()
// }
