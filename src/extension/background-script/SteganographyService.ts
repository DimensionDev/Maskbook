import { encode, decode } from '@dimensiondev/stego-js/es/dom'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/es/grayscale'
import { TransformAlgorithm } from '@dimensiondev/stego-js/es/transform'
import { OnlyRunInContext } from '@holoflows/kit/es'
import type { EncodeOptions, DecodeOptions } from '@dimensiondev/stego-js/es/stego'
import { getUrl, downloadUrl } from '../../utils/utils'
import { memoizePromise } from '../../utils/memoize'
import { getDimension } from '../../utils/image'
import { decodeArrayBuffer, encodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { saveAsFile } from './HelperService'

OnlyRunInContext('background', 'SteganographyService')

type Template = 'v1' | 'v2' | 'eth' | 'dai' | 'okb'
type Mask = 'v1' | 'v2' | 'transparent'

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
]

const defaultOptions = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
}

const isSameDimension = (dimension: Dimension, otherDimension: Dimension) =>
    dimension.width === otherDimension.width && dimension.height === otherDimension.height

const getMaskBuf = memoizePromise((type: Mask) => downloadUrl(getUrl(`/image-payload/mask-${type}.png`)), undefined)

type EncodeImageOptions = {
    template?: Template
} & PartialRequired<Required<EncodeOptions>, 'text' | 'pass'>

export async function encodeImage(buf: string | ArrayBuffer, options: EncodeImageOptions) {
    const { template } = options
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    return encodeArrayBuffer(
        await encode(_buf, await getMaskBuf(template === 'v2' ? template : 'transparent'), {
            ...defaultOptions,
            fakeMaskPixels: false,
            cropEdgePixels: template !== 'v2',
            exhaustPixels: true,
            grayscaleAlgorithm: GrayscaleAlgorithm.NONE,
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
    return decodeImage(await downloadUrl(url), options)
}

export function downloadImage({ buffer }: Uint8Array) {
    return saveAsFile(buffer, 'image/png', 'maskbook.png')
}
