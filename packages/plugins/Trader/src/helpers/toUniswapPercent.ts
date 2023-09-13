import { Percent } from '@uniswap/sdk-core'

export function toUniswapPercent(numerator: number, denominator: number) {
    return new Percent(numerator, denominator)
}
