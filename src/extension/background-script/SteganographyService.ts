import { encode, decode } from 'node-stego/es/dom'
import { buf2Img } from 'node-stego/es/canvas/dom'
import { createMask } from 'node-stego/es/mask'
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
    mask: getUrl('/maskbook-steganography_mask.png'),
}

const getDefaultMask = memoizePromise(
    async () => createMask(await buf2Img(await downloadUrl(getUrl('/maskbook-steganography_mask.png')))),
    undefined,
)

export async function encodeImage(
    { buffer }: Uint8Array,
    options: WithPartial<Required<EncodeOptions>, 'text' | 'pass'>,
) {
    return new Uint8Array(
        await encode(buffer, {
            ...defaultOptions,
            noCropEdgePixels: false,
            grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            transformAlgorithm: TransformAlgorithm.FFT1D,
            mask: await getDefaultMask(),
            ...options,
        }),
    )
}

export async function decodeImage({ buffer }: Uint8Array, options: WithPartial<Required<DecodeOptions>, 'pass'>) {
    return decode(buffer, {
        ...defaultOptions,
        transformAlgorithm: TransformAlgorithm.FFT1D,
        mask: await getDefaultMask(),
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
