import { encode, decode } from 'node-stego/es/dom'
import { GrayscaleAlgorithm } from 'node-stego/es/grayscale'
import { TransformAlgorithm } from 'node-stego/es/transform'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { EncodeOptions, DecodeOptions } from 'node-stego/es/stego'
import { getUrl, downloadUrl } from '../../utils/utils'
import { memoizePromise } from '../../utils/memoize'
import { getDimension } from '../../utils/image'

OnlyRunInContext('background', 'SteganographyService')

type Template = 'default' | 'eth' | 'dai'

type Dimension = {
    width: number
    height: number
}

const dimensions: Dimension[] = [
    {
        width: 1024,
        height: 1240,
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

const getMaskBuf = memoizePromise(() => downloadUrl(getUrl('/maskbook-mask-default.png')), undefined)

type EncodeImageOptions = {
    template?: Template
} & PartialRequired<Required<EncodeOptions>, 'text' | 'pass'>

export async function encodeImage(buf: Uint8Array, options: EncodeImageOptions) {
    const { template } = options
    return new Uint8Array(
        await encode(buf.buffer, await getMaskBuf(), {
            ...defaultOptions,
            fakeMaskPixels: template !== 'default',
            cropEdgePixels: true,
            exhaustPixels: true,
            grayscaleAlgorithm: template === 'default' ? GrayscaleAlgorithm.LUMINANCE : GrayscaleAlgorithm.NONE,
            transformAlgorithm: TransformAlgorithm.FFT1D,
            ...options,
        }),
    )
}

type DecodeImageOptions = PartialRequired<Required<DecodeOptions>, 'pass'>

export async function decodeImage(buf: Uint8Array, options: DecodeImageOptions) {
    const dimension = getDimension(buf)
    if (!dimensions.some(otherDimension => isSameDimension(dimension, otherDimension))) {
        return ''
    }
    return decode(buf.buffer, await getMaskBuf(), {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export function downloadImage({ buffer }: Uint8Array) {
    return browser.downloads.download({
        url: URL.createObjectURL(new Blob([buffer], { type: 'image/png' })),
        filename: 'maskbook.png',
        saveAs: true,
    })
}
