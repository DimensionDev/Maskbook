import { test, expect } from '@jest/globals'
import { toBase58 } from '../src/state/Connection/providers/BaseInjected'

test('Convert BN words to base58', () => {
    const words = [40317595, 32746130, 22487869, 4582950, 28891166, 32282744, 799318, 5096867, 19373157, 1769304, 0]
    const result = toBase58(words)
    expect(result).toEqual('8GYiQArcrQvVzTxQn6XXGwAb7pC5fi4spjxowKGTLszr')
})
