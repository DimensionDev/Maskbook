import { encode, decode } from 'node-stego/es/dom'
import { GrayscaleAlgorithm } from 'node-stego/es/grayscale'
import { TransformAlgorithm } from 'node-stego/es/transform'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { EncodeOptions, DecodeOptions } from 'node-stego/es/stego'

OnlyRunInContext('background', 'SteganographyService')

type WithPartial<T, K extends keyof T> = { [P in Exclude<keyof T, K>]?: T[P] | undefined } & { [P in K]: T[P] }

const defaultOptions = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
}

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
            ...options,
        }),
    )
}

export function decodeImage({ buffer }: Uint8Array, options: WithPartial<Required<DecodeOptions>, 'pass'>) {
    return decode(buffer, {
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
