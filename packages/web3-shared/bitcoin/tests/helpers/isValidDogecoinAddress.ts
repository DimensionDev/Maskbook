import { describe, test, expect } from 'vitest'
import { isValidDogecoinAddress } from '../../src/helpers/isValidDogecoinAddress.js'

describe('Dogecoin address validation', () => {
    test.each([
        {
            input: 'DEgDVFa2DoW1533dxeDVdTxQFhMzs1pMke',
            expected: true,
        },
        {
            input: 'ADNbM5fBujCRBW1vqezNeAWmnsLp19ki3n',
            expected: true,
        },
        {
            input: '9xqCpm3DpUYSzcoQSPb5SEGDwn9NRqwZnH',
            expected: true,
        },
        {
            input: 'AAAuy82AXsmzfbo4ixdLgkws4RR8C2iUGA',
            expected: true,
        },
        {
            // Bitcoin: Legacy address - P2PKH
            input: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            expected: false,
        },
        {
            // Bitcoin: Script address - P2SH
            input: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
            expected: false,
        },
        {
            // Bitcoin: SegWit address - P2WPKH
            input: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
            expected: false,
        },
        {
            // Bitcoin: Taproot address - P2TR
            input: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
            expected: false,
        },
        {
            input: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyy',
            expected: false,
        },
        {
            input: 'invalid-address',
            expected: false,
        },
    ])('.isValidDogecoinAddress($input)', ({ input, expected }) => {
        expect(isValidDogecoinAddress(input)).toBe(expected)
    })
})
