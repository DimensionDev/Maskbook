import { encode, decode, type GrayscaleAlgorithm, DEFAULT_MASK, type EncodeOptions } from '@masknet/stego-js'
import { getDimension } from './utils.js'
import { getPreset, findPreset } from './presets.js'
import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'

export { GrayscaleAlgorithm, AlgorithmVersion } from '@masknet/stego-js'

export interface SteganographyIO {
    downloadImage: (url: string) => Promise<ArrayBuffer>
}
export interface EncodeImageOptions extends SteganographyIO {
    data: string | Uint8Array
    password: string
    grayscaleAlgorithm?: GrayscaleAlgorithm
    preset: SteganographyPreset
}
export enum SteganographyPreset {
    Preset2021 = '2021',
    Preset2022 = '2022',
    Preset2023 = '2023',
}

export async function steganographyEncodeImage(buf: ArrayBuffer, options: EncodeImageOptions) {
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
    const dimension = getDimension(buffer)
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
