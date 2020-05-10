import Codec from '../codec'

// "Maskbook" Contants
const MASKBOOK_HEX = '4d61736b626f6f6b'
const MASKBOOK_BASE_64 = 'TWFza2Jvb2s='
const MASKBOOK_UTF_8 = 'Maskbook'

// Codec basic equal chain
function eqChain(codec: Codec) {
    expect(codec.toHex()).toBe(MASKBOOK_HEX)
    expect(codec.toBase64()).toBe(MASKBOOK_BASE_64)
    expect(codec.toUtf8()).toBe(MASKBOOK_UTF_8)
}

// Build Codec from hex
test('build codec from hex', () => {
    eqChain(Codec.fromHex(MASKBOOK_HEX))
})

// Build Codec from base64
test('build codec from base64', () => {
    eqChain(Codec.fromBase64(MASKBOOK_BASE_64))
})

// Build Codec from utf-8
test('build codec from utf-8', () => {
    eqChain(Codec.fromUtf8(MASKBOOK_UTF_8))
})
