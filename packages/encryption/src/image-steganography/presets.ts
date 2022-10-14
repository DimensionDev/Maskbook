import { unreachable } from '@dimensiondev/kit'
import { AlgorithmVersion, GrayscaleAlgorithm, TransformAlgorithm, type EncodeOptions } from '@dimensiondev/stego-js'
import { SteganographyPreset } from './index.js'

/** @internal */
export interface Dimension {
    width: number
    height: number
}

/** @internal */
export interface Preset extends Dimension {
    mask: string
    type: 'string' | 'raw'
    description: string
    options: Omit<EncodeOptions, 'text'>
}

const libV1AlgrDefaults: Omit<EncodeOptions, 'text'> = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 128,
    exhaustPixels: true,
    cropEdgePixels: false,
    fakeMaskPixels: false,
    grayscaleAlgorithm: GrayscaleAlgorithm.NONE,
    transformAlgorithm: TransformAlgorithm.FFT1D,
    version: AlgorithmVersion.V1,
}
const libV2AlgrDefaults: Omit<EncodeOptions, 'text'> = {
    size: 8,
    narrow: 0,
    copies: 3,
    tolerance: 400,
    exhaustPixels: false,
    cropEdgePixels: false,
    fakeMaskPixels: false,
    grayscaleAlgorithm: GrayscaleAlgorithm.NONE,
    transformAlgorithm: TransformAlgorithm.FFT2D,
    version: AlgorithmVersion.V2,
}

const Preset2021: Preset = {
    type: 'string',
    description: 'the preset we used for payload V37',
    width: 1200,
    height: 681,
    mask: new URL('./masks/mask-v2.png', import.meta.url).toString(),
    options: libV1AlgrDefaults,
}

const Preset2022: Preset = {
    type: 'raw',
    description: 'the preset we used for payload V38',
    width: 1200,
    height: 690,
    // TODO: change a new picture?
    mask: new URL('./masks/mask-v2.png', import.meta.url).toString(),
    options: libV2AlgrDefaults,
}

const dimensionPreset: readonly Preset[] = [
    Preset2021,
    Preset2022,
    {
        type: 'raw',
        description: 'legacy post',
        width: 1024,
        height: 1240,
        mask: new URL('./masks/mask-v1.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
    {
        type: 'raw',
        description: 'legacy post',
        width: 1200,
        height: 680,
        mask: new URL('./masks/mask-transparent.png', import.meta.url).toString(),
        options: {
            ...libV1AlgrDefaults,
            cropEdgePixels: true,
        },
    },
    {
        type: 'raw',
        description: 'used in event election 2020',
        width: 1000,
        height: 558,
        mask: new URL('./masks/mask-transparent.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
    {
        type: 'raw',
        description: 'old NFT',
        width: 1000,
        height: 560,
        mask: new URL('./masks/mask-v4.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
]

/** @internal */
export function findPreset(dimension: Dimension) {
    return dimensionPreset.find((d) => isSameDimension(d, dimension))
}
export function getPreset(preset: SteganographyPreset): Preset {
    if (preset === SteganographyPreset.Preset2021) return Preset2021
    if (preset === SteganographyPreset.Preset2022) return Preset2022
    unreachable(preset)
}
function isSameDimension(dimension: Dimension, otherDimension: Dimension) {
    return dimension.width === otherDimension.width && dimension.height === otherDimension.height
}
