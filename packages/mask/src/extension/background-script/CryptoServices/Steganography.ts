import { omit } from 'lodash-es'
import { blobToArrayBuffer } from '@dimensiondev/kit'
import { encode, decode } from '@dimensiondev/stego-js/cjs/dom'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale'
import { TransformAlgorithm } from '@dimensiondev/stego-js/cjs/transform'
import type { EncodeOptions, DecodeOptions } from '@dimensiondev/stego-js/cjs/stego'
import { downloadUrl } from '../../../utils/utils'
import { memoizePromise } from '../../../../utils-pure'
import { getDimension } from '../../../utils/image'
import type { ImageTemplateTypes } from '../../../resources/image-payload'

type Dimension = {
    width: number
    height: number
}

const dimensionPreset: (Dimension & {
    mask: string
    template?: ImageTemplateTypes
    options?: Partial<EncodeOptions>
})[] = [
    // @deprecated legacy post
    {
        width: 1024,
        height: 1240,
        mask: new URL('./SteganographyResources/mask-v1.png', import.meta.url).toString(),
    },
    // text
    {
        width: 1200,
        height: 681,
        template: 'v2',
        mask: new URL('./SteganographyResources/mask-v2.png', import.meta.url).toString(),
    },
    // lucky drop
    {
        width: 1200,
        height: 680,
        template: 'eth',
        mask: new URL('./SteganographyResources/mask-transparent.png', import.meta.url).toString(),
        options: {
            cropEdgePixels: true,
        },
    },
    // @deprecated election 2020
    {
        width: 1000,
        height: 558,
        mask: new URL('./SteganographyResources/mask-transparent.png', import.meta.url).toString(),
    },
    // @deprecated NFT
    {
        width: 1000,
        height: 560,
        mask: new URL('./SteganographyResources/mask-v4.png', import.meta.url).toString(),
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

const getMaskBuf = memoizePromise(async (url: string) => blobToArrayBuffer(await downloadUrl(url)), void 0)

export type EncodeImageOptions = {
    template?: ImageTemplateTypes
} & PartialRequired<Required<EncodeOptions>, 'text' | 'pass'>

export async function steganographyEncodeImage(buf: ArrayBuffer, options: EncodeImageOptions) {
    const { template } = options
    const preset = dimensionPreset.find((d) => d.template && d.template === template)
    if (!preset) throw new Error('Failed to find preset.')
    return new Uint8Array(
        await encode(buf, await getMaskBuf(preset.mask), {
            ...defaultOptions,
            ...preset?.options,
            ...omit(options, 'template'),
        }),
    )
}

export type DecodeImageOptions = PartialRequired<Required<DecodeOptions>, 'pass'>

async function steganographyDecodeImage(buf: ArrayBuffer, options: DecodeImageOptions) {
    const dimension = getDimension(buf)
    const preset = dimensionPreset.find((d) => isSameDimension(d, dimension))
    if (!preset) return ''
    return decode(buf, await getMaskBuf(preset.mask), {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export async function steganographyDecodeImageUrl(url: string, options: DecodeImageOptions) {
    return steganographyDecodeImage(await blobToArrayBuffer(await downloadUrl(url)), options)
}
