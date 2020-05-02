import Codec from '../codec'

// Build Codec from binary
test('build codec from binary', () => {
    const codec = new Codec('0100110101100001011100110110101101100010011011110110111101101011')
    expect(codec.toBinary() === '0100110101100001011100110110101101100010011011110110111101101011')
    expect(codec.toHex() === '4d61736b626f6f6b')
    expect(codec.toBase64() === 'TWFza2Jvb2s=')
    expect(codec.toString() === 'Maskbook')
})

// Build Codec from hex
test('build codec from hex', () => {
    const codec = Codec.fromHex('4d61736b626f6f6b')
    expect(codec.toBinary() === '0100110101100001011100110110101101100010011011110110111101101011')
    expect(codec.toHex() === '4d61736b626f6f6b')
    expect(codec.toBase64() === 'TWFza2Jvb2s=')
    expect(codec.toString() === 'Maskbook')
})

// Build Codec from base64
test('build codec from base64', () => {
    const codec = Codec.fromHex('4d61736b626f6f6b')
    expect(codec.toBinary() === '0100110101100001011100110110101101100010011011110110111101101011')
    expect(codec.toHex() === '4d61736b626f6f6b')
    expect(codec.toBase64() === 'TWFza2Jvb2s=')
    expect(codec.toString() === 'Maskbook')
})

// Build Codec from utf-16
test('build codec from utf-16', () => {
    const codec = Codec.fromUtf16('Maskbook')
    expect(codec.toBinary() === '0100110101100001011100110110101101100010011011110110111101101011')
    expect(codec.toHex() === '4d61736b626f6f6b')
    expect(codec.toBase64() === 'TWFza2Jvb2s=')
    expect(codec.toString() === 'Maskbook')
})
