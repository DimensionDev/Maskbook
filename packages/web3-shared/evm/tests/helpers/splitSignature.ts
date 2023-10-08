import { describe, expect, test } from 'vitest'
import { splitSignature } from '../../src/helpers/splitSignature.js'

const signed =
    '0x670f45faac741b2c2d742007482790ed1bb87ca9b7e7680a8314c1cf96eabbb55f98114c10ade72b2fcdd6fdaa10811a337919e77862976355ea63d34cd2699f1c'

describe('splitSignature', () => {
    test('should split signature', () => {
        const result = splitSignature(signed)

        expect(result.r).toBe('0x670f45faac741b2c2d742007482790ed1bb87ca9b7e7680a8314c1cf96eabbb5')
        expect(result.s).toBe('0x5f98114c10ade72b2fcdd6fdaa10811a337919e77862976355ea63d34cd2699f')
        expect(result.v).toBe(28)
    })
})
