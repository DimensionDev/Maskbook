import { GrayscaleAlgorithm, TransformAlgorithm, type EncodeOptions } from '@dimensiondev/stego-js'

/** @internal */
export interface Dimension {
    width: number
    height: number
}
interface Preset extends Dimension {
    mask: string
    deprecated?: string
    options?: Partial<EncodeOptions>
}
/** @internal */
export const currentUsingPreset: Preset = {
    width: 1200,
    height: 681,
    mask: new URL('./masks/mask-v2.png', import.meta.url).toString(),
}
const dimensionPreset: readonly Preset[] = [
    {
        deprecated: 'legacy post',
        width: 1024,
        height: 1240,
        mask: new URL('./masks/mask-v1.png', import.meta.url).toString(),
    },
    currentUsingPreset,
    {
        width: 1200,
        height: 680,
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
/** @internal */
export const defaultOptions = {
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

/** @internal */
export function findPreset(dimension: Dimension) {
    return dimensionPreset.find((d) => isSameDimension(d, dimension))
}
function isSameDimension(dimension: Dimension, otherDimension: Dimension) {
    return dimension.width === otherDimension.width && dimension.height === otherDimension.height
}
