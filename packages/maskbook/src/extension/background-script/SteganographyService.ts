import { encode, decode } from '@dimensiondev/stego-js/cjs/dom'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale'
import { TransformAlgorithm } from '@dimensiondev/stego-js/cjs/transform'
import type { EncodeOptions, DecodeOptions } from '@dimensiondev/stego-js/cjs/stego'
import { downloadUrl } from '../../utils/utils'
import { memoizePromise } from '../../utils/memoize'
import { getDimension } from '../../utils/image'
import { decodeArrayBuffer, encodeArrayBuffer, blobToArrayBuffer } from '@dimensiondev/kit'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { ImageTemplateTypes } from '../../resources/image-payload'

assertEnvironment(Environment.ManifestBackground)

type Mask = 'v1' | 'v2' | 'v4' | 'transparent'

type Dimension = {
    width: number
    height: number
}

const dimensionPreset: (Dimension & { mask: Mask })[] = [
    {
        width: 1024,
        height: 1240,
        mask: 'v1',
    },
    {
        width: 1200,
        height: 681,
        mask: 'v2',
    },
    {
        width: 1200,
        height: 680,
        mask: 'transparent',
    },
    {
        width: 1000,
        height: 558,
        mask: 'transparent',
    },
    {
        width: 1000,
        height: 560,
        mask: 'v4',
    },
]

const defaultOptions = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
}

const isSameDimension = (dimension: Dimension, otherDimension: Dimension) =>
    dimension.width === otherDimension.width && dimension.height === otherDimension.height

const images: Record<Mask, string> = {
    v1: new URL('./SteganographyResources/mask-v1.png', import.meta.url).toString(),
    v2: new URL('./SteganographyResources/mask-v2.png', import.meta.url).toString(),
    v4: new URL('./SteganographyResources/mask-v4.png', import.meta.url).toString(),
    transparent: new URL('./SteganographyResources/mask-transparent.png', import.meta.url).toString(),
}
const getMaskBuf = memoizePromise(async (type: Mask) => blobToArrayBuffer(await downloadUrl(images[type])), void 0)

type EncodeImageOptions = {
    template?: ImageTemplateTypes
} & PartialRequired<Required<EncodeOptions>, 'text' | 'pass'>

export async function encodeImage(buf: string | ArrayBuffer, options: EncodeImageOptions) {
    const { template } = options
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    return encodeArrayBuffer(
        await encode(_buf, await getMaskBuf(template === 'v2' || template === 'v4' ? template : 'transparent'), {
            ...defaultOptions,
            fakeMaskPixels: false,
            cropEdgePixels: template !== 'v2' && template !== 'v3' && template !== 'v4',
            exhaustPixels: true,
            grayscaleAlgorithm: template === 'v3' ? GrayscaleAlgorithm.LUMINANCE : GrayscaleAlgorithm.NONE,
            transformAlgorithm: TransformAlgorithm.FFT1D,
            ...options,
        }),
    )
}

type DecodeImageOptions = PartialRequired<Required<DecodeOptions>, 'pass'>

export async function decodeImage(buf: string | ArrayBuffer, options: DecodeImageOptions) {
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    const _dimension = getDimension(_buf)
    const preset = dimensionPreset.find((d) => isSameDimension(d, _dimension))
    if (!preset) return ''
    return decode(_buf, await getMaskBuf(preset.mask), {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export async function decodeImageUrl(url: string, options: DecodeImageOptions) {
    return decodeImage(await blobToArrayBuffer(await downloadUrl(url)), options)
}
