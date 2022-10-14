import { encode, decode, GrayscaleAlgorithm } from '@dimensiondev/stego-js'
import type { EncodeOptions } from '@dimensiondev/stego-js'
import { getDimension } from './utils.js'
import { getPreset, findPreset } from './presets.js'
import { encodeArrayBuffer } from '@dimensiondev/kit'

export { GrayscaleAlgorithm, AlgorithmVersion } from '@dimensiondev/stego-js'

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
}

export async function steganographyEncodeImage(buf: ArrayBuffer, options: EncodeImageOptions) {
    const { downloadImage, data, password, grayscaleAlgorithm } = options
    const preset = getPreset(options.preset)
    if (!preset) throw new Error('Failed to find preset.')

    const optionalOptions: Partial<Readwrite<EncodeOptions>> = {}
    if (grayscaleAlgorithm) optionalOptions.grayscaleAlgorithm = grayscaleAlgorithm

    const text = typeof data === 'string' ? data : encodeArrayBuffer(data)

    return new Uint8Array(
        await encode(buf, await downloadImage(preset.mask), {
            ...preset.options,
            ...optionalOptions,
            text,
            pass: password,
        }),
    )
}

export type DecodeImageOptions = SteganographyIO & Partial<EncodeOptions> & Pick<EncodeOptions, 'pass'>

export async function steganographyDecodeImage(image: Blob | string, options: DecodeImageOptions) {
    const buffer = typeof image === 'string' ? await options.downloadImage(image) : await image.arrayBuffer()
    const dimension = getDimension(buffer)
    const preset = findPreset(dimension)
    if (!preset) return ''
    return decode(buffer, await options.downloadImage(preset.mask), {
        ...preset.options,
        ...options,
    })
}
