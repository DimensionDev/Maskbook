import { TransformAlgorithm, encode, decode } from '@dimensiondev/stego-js'
import type { EncodeOptions } from '@dimensiondev/stego-js'
import { omit } from 'lodash-unified'
import { getDimension } from './utils.js'
import { currentUsingPreset, defaultOptions, findPreset } from './presets.js'

export { GrayscaleAlgorithm, AlgorithmVersion } from '@dimensiondev/stego-js'

export interface SteganographyIO {
    downloadImage: (url: string) => Promise<ArrayBuffer>
}
export type EncodeImageOptions = SteganographyIO &
    Partial<EncodeOptions> &
    Pick<EncodeOptions, 'text' | 'pass' | 'version'>

export async function steganographyEncodeImage(buf: ArrayBuffer, options: EncodeImageOptions) {
    const { downloadImage } = options
    const preset = currentUsingPreset
    if (!preset) throw new Error('Failed to find preset.')
    return new Uint8Array(
        await encode(buf, await downloadImage(preset.mask), {
            ...defaultOptions,
            ...preset?.options,
            ...omit(options, 'template'),
        }),
    )
}

export type DecodeImageOptions = SteganographyIO & Partial<EncodeOptions> & Pick<EncodeOptions, 'pass' | 'version'>

async function inner(buf: ArrayBuffer, options: DecodeImageOptions) {
    const dimension = getDimension(buf)
    const preset = findPreset(dimension)
    if (!preset) return ''
    return decode(buf, await options.downloadImage(preset.mask), {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export async function steganographyDecodeImage(image: Blob | string, options: DecodeImageOptions) {
    return inner(typeof image === 'string' ? await options.downloadImage(image) : await image.arrayBuffer(), options)
}
