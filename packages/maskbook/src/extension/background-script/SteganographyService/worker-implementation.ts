import { algorithms, DecodeOptions, EncodeOptions } from '@dimensiondev/stego-js'

export function encode(image: ImageData, mask: ImageData, options: EncodeOptions) {
    return algorithms[options.version].encode(image, mask, options)
}

export function decode(image: ImageData, mask: ImageData, options: DecodeOptions) {
    return algorithms[options.version].decode(image, mask, options)
}
