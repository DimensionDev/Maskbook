import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { decodeArrayBuffer, encodeArrayBuffer, memoizePromise } from '@dimensiondev/kit'
import {
    AlgorithmVersion,
    DecodeOptions,
    EncodeOptions,
    GrayscaleAlgorithm,
    TransformAlgorithm,
} from '@dimensiondev/stego-js'
import { getDimension } from '../../../utils/image'
import { downloadUrl, getUrl } from '../../../utils/utils'
import { decode, encode } from './api'

assertEnvironment(Environment.ManifestBackground)

type Template = 'v1' | 'v2' | 'v3' | 'v4' | 'eth' | 'dai' | 'okb'
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

const defaultOptions: Pick<EncodeOptions, 'size' | 'narrow' | 'copies' | 'tolerance'> = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
}

const isSameDimension = (dimension: Dimension, otherDimension: Dimension) =>
    dimension.width === otherDimension.width && dimension.height === otherDimension.height

const getMaskBuf = memoizePromise(
    async (type: Mask) => (await downloadUrl(getUrl(`/image-payload/mask-${type}.png`))).arrayBuffer(),
    undefined,
)

type EncodeImageOptions = {
    template?: Template
} & PartialRequired<Required<EncodeOptions>, 'text' | 'pass'>

export async function encodeImage(buf: string | ArrayBuffer, options: EncodeImageOptions) {
    const { template } = options
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    const mask = await getMaskBuf(template === 'v2' || template === 'v4' ? template : 'transparent')
    return encodeArrayBuffer(
        await encode(_buf, mask, {
            ...defaultOptions,
            version: AlgorithmVersion.V1,
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
        version: AlgorithmVersion.V1,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        ...options,
    })
}

export async function decodeImageUrl(url: string, options: DecodeImageOptions) {
    return decodeImage(await (await downloadUrl(url)).arrayBuffer(), options)
}
