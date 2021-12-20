import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale.js'
import { TransformAlgorithm } from '@dimensiondev/stego-js/cjs/transform.js'
import { encode, decode } from '@dimensiondev/stego-js/cjs/dom.js'
import type { EncodeOptions } from '@dimensiondev/stego-js/cjs/stego.js'
import { omit } from 'lodash-unified'
import { getDimension } from './utils'

export { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale.js'
export type ImageTemplateTypes = 'v2' | 'eth'

interface Dimension {
    width: number
    height: number
}
interface Preset extends Dimension {
    mask: string
    deprecated?: string
    template?: ImageTemplateTypes
    options?: Partial<EncodeOptions>
}
const dimensionPreset: Preset[] = [
    {
        deprecated: 'legacy post',
        width: 1024,
        height: 1240,
        mask: new URL('./masks/mask-v1.png', import.meta.url).toString(),
    },
    {
        width: 1200,
        height: 681,
        template: 'v2',
        mask: new URL('./masks/mask-v2.png', import.meta.url).toString(),
    },
    {
        width: 1200,
        height: 680,
        template: 'eth',
        mask: new URL('./masks/mask-transparent.png', import.meta.url).toString(),
        options: {
            cropEdgePixels: true,
        },
    },
    {
        deprecated: 'event election 2020',
        width: 1000,
        height: 558,
        mask: new URL('./masks/mask-transparent.png', import.meta.url).toString(),
    },
    {
        deprecated: 'old NFT',
        width: 1000,
        height: 560,
        mask: new URL('./masks/mask-v4.png', import.meta.url).toString(),
    },
]

const defaultOptions = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
    exhaustPixels: true,
    cropEdgePixels: false,
    fakeMaskPixels: false,
    grayscaleAlgorithm: GrayscaleAlgorithm.NONE,
    transformAlgorithm: TransformAlgorithm.FFT1D,
}

const isSameDimension = (dimension: Dimension, otherDimension: Dimension) =>
    dimension.width === otherDimension.width && dimension.height === otherDimension.height

export interface SteganographyIO {
    downloadImage: (url: string) => Promise<ArrayBuffer>
}
export type EncodeImageOptions = SteganographyIO &
    Partial<EncodeOptions> &
    Pick<EncodeOptions, 'text' | 'pass'> & {
        template?: ImageTemplateTypes
    }

export async function steganographyEncodeImage(buf: ArrayBuffer, options: EncodeImageOptions) {
    const { template, downloadImage } = options
    const preset = dimensionPreset.find((d) => d.template && d.template === template)
    if (!preset) throw new Error('Failed to find preset.')
    return new Uint8Array(
        await encode(buf, await downloadImage(preset.mask), {
            ...defaultOptions,
            ...preset?.options,
            ...omit(options, 'template'),
        }),
    )
}

export type DecodeImageOptions = SteganographyIO & Partial<EncodeOptions> & Pick<EncodeOptions, 'pass'>

async function steganographyDecodeImage(buf: ArrayBuffer, options: DecodeImageOptions) {
    const dimension = getDimension(buf)
    const preset = dimensionPreset.find((d) => isSameDimension(d, dimension))
    if (!preset) return ''
    return decode(buf, await options.downloadImage(preset.mask), {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export async function steganographyDecodeImageUrl(url: string, options: DecodeImageOptions) {
    return steganographyDecodeImage(await options.downloadImage(url), options)
}
