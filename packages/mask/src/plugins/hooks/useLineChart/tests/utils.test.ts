import { describe, expect, test } from 'vitest'
import { fixOverPosition } from '../utils.js'

describe('chart element position', () => {
    test.each([
        { x: 25, y: 25, expected: { x: 25, y: 25 } },
        { x: 50, y: 50, expected: { x: 45, y: 45 } },
        { x: 0, y: 50, expected: { x: 5, y: 45 } },
        { x: 1, y: 50, expected: { x: 5, y: 45 } },
        { x: 50, y: 0, expected: { x: 45, y: 5 } },
        { x: 0, y: 0, expected: { x: 5, y: 5 } },
        { x: 1, y: 1, expected: { x: 5, y: 5 } },
    ])('.fixOverPosition(%x, %y)', ({ x, y, expected }) => {
        const result = fixOverPosition(50, 50, x, y, 5, 5)
        expect(result).toStrictEqual(expected)
    })
})
