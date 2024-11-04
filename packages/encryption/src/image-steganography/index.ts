import { encode, decode, type GrayscaleAlgorithm, DEFAULT_MASK, type EncodeOptions } from '@masknet/stego-js'
import { decodeArrayBuffer, encodeArrayBuffer, getDimensionByDOM } from '@masknet/kit'
import { getDimensionAsBuffer } from './getDimensionAsBuffer.js'
import { getPreset, findPreset, type SteganographyPreset } from './presets.js'
import type { Readwrite } from '../types/index.js'

export { GrayscaleAlgorithm } from '@masknet/stego-js'

export { SteganographyPreset } from './presets.js'

export interface SteganographyIO {
    downloadImage: (url: string) => Promise<ArrayBuffer>
}
export interface EncodeImageOptions extends SteganographyIO {
    data: string | Uint8Array
    password: string
    grayscaleAlgorithm?: GrayscaleAlgorithm
    preset: SteganographyPreset
}

export async function steganographyEncodeImage(buf: ArrayLike<number> | ArrayBufferLike, options: EncodeImageOptions) {
    const { downloadImage, data, password, grayscaleAlgorithm } = options
    const preset = getPreset(options.preset)
    if (!preset) throw new Error('Failed to find preset.')

    const optionalOptions: Partial<Readwrite<EncodeOptions>> = {}
    if (grayscaleAlgorithm) optionalOptions.grayscaleAlgorithm = grayscaleAlgorithm

    if (preset.type === 'string' && typeof data !== 'string')
        throw new TypeError('The chosen preset must be used with string')
    if (preset.type === 'raw' && typeof data === 'string')
        throw new TypeError('The chosen preset must be used with Uint8Array')

    const text = typeof data === 'string' ? data : encodeArrayBuffer(data)

    return new Uint8Array(
        await encode(buf, preset.mask ? await downloadImage(preset.mask) : new Uint8Array(DEFAULT_MASK), {
            ...preset.options,
            ...optionalOptions,
            text,
            pass: password,
        }),
    )
}

export interface DecodeImageOptions extends SteganographyIO {
    password: string
}

export async function steganographyDecodeImage(image: Blob | string, options: DecodeImageOptions) {
    const buffer = typeof image === 'string' ? await options.downloadImage(image) : await image.arrayBuffer()

    const dimension = (await getDimensionByDOM(image).catch(() => undefined)) ?? getDimensionAsBuffer(buffer)
    if (!dimension) return null

    const preset = findPreset(dimension)
    if (!preset) return null

    const result = decode(
        buffer,
        preset.mask ? await options.downloadImage(preset.mask) : new Uint8Array(DEFAULT_MASK),
        {
            ...preset.options,
            pass: options.password,
        },
    )
    if (preset.type === 'raw') return new Uint8Array(decodeArrayBuffer(await result))
    return result
}
