import { getDimension } from '../image'

function n2ab(num: number, bytes: 1 | 2 | 4) {
    const ab = new ArrayBuffer(bytes)
    const dv = new DataView(ab)
    switch (bytes) {
        case 1:
            dv.setUint8(0, num)
            break
        case 2:
            dv.setUint16(0, num, false)
            break
        case 4:
            dv.setUint32(0, num, false) // big-endian
            break
    }
    return new Uint8Array(ab)
}

function createJPEGBuffer(width: number, height: number) {
    return new Uint8Array([
        // SOI
        0xff,
        0xd8,

        // APP0
        0xff,
        0xe0,
        ...n2ab(16, 2), // length
        'J'.charCodeAt(0),
        'F'.charCodeAt(0),
        'I'.charCodeAt(0),
        'F'.charCodeAt(0),
        0,
        1, // major version
        0, // minor version
        0, // units for x/y densities
        ...n2ab(1, 2), // x-density
        ...n2ab(1, 2), // y-density
        0, // thumbnail width
        0, // thumbnail height

        // SOF0 baseline DCT
        0xff,
        0xc0,
        ...n2ab(11, 2), // length
        0x08, // data precision
        ...n2ab(width, 2),
        ...n2ab(height, 2),
        1, // number of components
        0, // component id
        0, // sampling factors
        0, // quantization table number

        // EOI
        0xff,
        0xd9,
    ]).buffer
}

function createPNGBuffer(width: number, height: number) {
    return new Uint8Array([
        0x89,
        'P'.charCodeAt(0),
        'N'.charCodeAt(0),
        'G'.charCodeAt(0),
        0x0d,
        0x0a,
        0x1a,
        0x0a,

        // IHDR chunk
        ...n2ab(13, 4), // chunk size 13 bytes
        'I'.charCodeAt(0),
        'H'.charCodeAt(0),
        'D'.charCodeAt(0),
        'R'.charCodeAt(0),
        ...n2ab(width, 4),
        ...n2ab(height, 4),
        0, // depth
        0, // color type
        0, // compression method
        0, // filter method
        0, // interlace method
    ]).buffer
}

test('Get dimension of JPEG buffer', () => {
    const { width, height } = getDimension(createJPEGBuffer(10, 10))
    expect(width).toBe(10)
    expect(height).toBe(10)
})

test('Get dimension of PNG buffer', () => {
    const { width, height } = getDimension(createPNGBuffer(10, 10))
    expect(width).toBe(10)
    expect(height).toBe(10)
})

test('Get dimension of unknown buffer', () => {
    const { width, height } = getDimension(new Uint8Array())
    expect(width).toBe(0)
    expect(height).toBe(0)
})
