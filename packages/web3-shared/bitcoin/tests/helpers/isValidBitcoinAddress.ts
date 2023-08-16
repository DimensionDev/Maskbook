import { describe, test, expect } from 'vitest'
import { isValidBitcoinAddress } from '../../src/helpers/isValidBitcoinAddress.js'

describe('Bitcoin address validation', () => {
    test.each([
        {
            // Legacy address - P2PKH
            input: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            expected: true,
        },
        {
            // Script address - P2SH
            input: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
            expected: true,
        },
        {
            // SegWit address - P2WPKH
            input: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
            expected: true,
        },
        {
            // Taproot address - P2TR
            input: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
            expected: true,
        },
        {
            // Dogecoin
            input: 'DEgDVFa2DoW1533dxeDVdTxQFhMzs1pMke',
            expected: false,
        },
        {
            // Dogecoin
            input: 'ADNbM5fBujCRBW1vqezNeAWmnsLp19ki3n',
            expected: false,
        },
        {
            // Dogecoin
            input: '9xqCpm3DpUYSzcoQSPb5SEGDwn9NRqwZnH',
            expected: false,
        },
        {
            // Dogecoin
            input: 'AAAuy82AXsmzfbo4ixdLgkws4RR8C2iUGA',
            expected: false,
        },
        {
            input: 'bc1qar0srrr7xfkvy5l643 lydnw9re59gtzzwf5mdqq',
            expected: false,
        },
        {
            input: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', // Too short
            expected: false,
        },
        {
            input: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyy', // Too long
            expected: false,
        },
        {
            input: 'invalid-address', // Invalid format
            expected: false,
        },
    ])('.isValidBitcoinAddress($input)', ({ input, expected }) => {
        expect(isValidBitcoinAddress(input)).toBe(expected)
    })
})
