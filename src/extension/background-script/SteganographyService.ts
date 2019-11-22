import { encode, decode } from 'node-stego/es/dom'
import { GrayscaleAlgorithm } from 'node-stego/es/grayscale'
import { TransformAlgorithm } from 'node-stego/es/transform'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { EncodeOptions, DecodeOptions } from 'node-stego/es/stego'
import { getUrl, downloadUrl } from '../../utils/utils'
import { memoizePromise } from '../../utils/memoize'

OnlyRunInContext('background', 'SteganographyService')

type WithPartial<T, K extends keyof T> = { [P in Exclude<keyof T, K>]?: T[P] | undefined } & { [P in K]: T[P] }

const defaultOptions = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
}

const getMaskBuf = memoizePromise(() => downloadUrl(getUrl('/maskbook-steganography-mask.png')), undefined)

export async function encodeImage(
    { buffer: imgBuf }: Uint8Array,
    options: WithPartial<Required<EncodeOptions>, 'text' | 'pass'>,
) {
    return new Uint8Array(
        await encode(imgBuf, await getMaskBuf(), {
            ...defaultOptions,
            noCropEdgePixels: false,
            grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            transformAlgorithm: TransformAlgorithm.FFT1D,
            ...options,
        }),
    )
}

export async function decodeImage(
    { buffer: imgBuf }: Uint8Array,
    options: WithPartial<Required<DecodeOptions>, 'pass'>,
) {
    return decode(imgBuf, await getMaskBuf(), {
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
