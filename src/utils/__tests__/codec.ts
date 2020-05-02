import Codec from '../codec'
import { parse } from 'twemoji-parser'

// "Maskbook" Contants
const MASKBOOK_BINARY = '0100110101100001011100110110101101100010011011110110111101101011'
const MASKBOOK_HEX = '4d61736b626f6f6b'
const MASKBOOK_BASE_64 = 'TWFza2Jvb2s='
const MASKBOOK_UTF_8 = 'Maskbook'
const MASKBOOK_BASE_1024 = '🧪🏉🅾🍃🎼🍻🕍==='
const MASKBOOK_BASE_2048 = '🍁♂👏🏼👍🏽💂‍♂️🤱🏽='

// Codec basic equal chain
function eqChain(codec: Codec) {
    expect(codec.toBinary()).toBe(MASKBOOK_BINARY)
    expect(codec.toHex()).toBe(MASKBOOK_HEX)
    expect(codec.toBase64()).toBe(MASKBOOK_BASE_64)
    expect(codec.toBase1024()).toBe(MASKBOOK_BASE_1024)
    expect(codec.toBase2048()).toBe(MASKBOOK_BASE_2048)
    expect(codec.toString()).toBe(MASKBOOK_UTF_8)
}

// Build Codec from binary
test('build codec from binary', () => {
    eqChain(Codec.fromBinary(MASKBOOK_BINARY))
})

// Build Codec from hex
test('build codec from hex', () => {
    eqChain(Codec.fromHex(MASKBOOK_HEX))
})

// Build Codec from base64
test('build codec from base64', () => {
    eqChain(Codec.fromBase64(MASKBOOK_BASE_64))
})

// Build Codec from base1024
test('build codec from base1024', () => {
    eqChain(Codec.fromBase1024(MASKBOOK_BASE_1024))
})

// Build Codec from base2048
test('build codec from base2048', () => {
    eqChain(Codec.fromBase2048(MASKBOOK_BASE_2048))
})

// Build Codec from utf-8
test('build codec from utf-8', () => {
    eqChain(Codec.fromUtf8(MASKBOOK_UTF_8))
})
