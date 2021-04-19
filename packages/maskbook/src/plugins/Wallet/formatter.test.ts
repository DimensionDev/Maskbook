import type { BigNumber } from 'bignumber.js'
jest.mock('../../utils/i18n-next', () => ({
    i18n: {
        t: (str: string) => str,
    },
}))
import { formatBalance } from './formatter'

describe('formatter', () => {
    describe('formatBalance', () => {
        it.each<[rawValue: BigNumber.Value, decimals: number, significant: number, result: string]>([
            ['0', 2, 2, '0'],
            ['0.1', 2, 2, '0'],
        ])('formatBalance(%s, %d, %d) return %s', (rawValue, decimals, significant, result) => {
            expect(formatBalance(rawValue, decimals, significant)).toBe(result)
        })
    })
})
