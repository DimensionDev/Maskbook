import BigNumber from 'bignumber.js'

/** 10 ** n */
export function pow10(n: BigNumber.Value, m?: BigNumber.Value) {
    return new BigNumber(10).pow(n, m)
}
