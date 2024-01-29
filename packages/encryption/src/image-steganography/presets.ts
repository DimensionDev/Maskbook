import { unreachable } from '@masknet/kit'
import { AlgorithmVersion, GrayscaleAlgorithm, TransformAlgorithm, type EncodeOptions } from '@masknet/stego-js'

/** @internal */
export interface Dimension {
    width: number
    height: number
}

interface Preset extends Dimension {
    mask: string | null
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
    description: 'the preset we used for payload V38 with v1 algorithm',
    width: 1200,
    height: 681,
    mask: new URL('../../assets/mask-v2.png', import.meta.url).toString(),
    options: libV1AlgrDefaults,
}

const Preset2022: Preset = {
    type: 'string',
    description: 'the preset we used for payload V38',
    width: 1200,
    height: 682,
    mask: null,
    options: libV2AlgrDefaults,
}

const Preset2023: Preset = {
    type: 'raw',
    description: 'the preset we used for payload V37',
    width: 1200,
    height: 671,
    mask: null,
    options: libV2AlgrDefaults,
}

const Preset2023_Firefly: Preset = {
    type: 'raw',
    description: 'the preset we used for firefly PC',
    width: 1200,
    height: 840,
    mask: null,
    options: libV2AlgrDefaults,
}

const dimensionPreset: readonly Preset[] = [
    Preset2023_Firefly,
    Preset2023,
    Preset2022,
    Preset2021,
    {
        type: 'string',
        description: 'legacy post',
        width: 1024,
        height: 1240,
        mask: new URL('../../assets/mask-v1.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
    {
        type: 'string',
        description: 'legacy post',
        width: 1200,
        height: 680,
        mask: new URL('../../assets/mask-transparent.png', import.meta.url).toString(),
        options: {
            ...libV1AlgrDefaults,
            cropEdgePixels: true,
        },
    },
    {
        type: 'string',
        description: 'used in event election 2020',
        width: 1000,
        height: 558,
        mask: new URL('../../assets/mask-transparent.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
    {
        type: 'string',
        description: 'old NFT',
        width: 1000,
        height: 560,
        mask: new URL('../../assets/mask-v4.png', import.meta.url).toString(),
        options: libV1AlgrDefaults,
    },
]

export enum SteganographyPreset {
    Preset2021 = '2021',
    Preset2022 = '2022',
    Preset2023 = '2023',
    Preset2023_Firefly = '2023_Firefly',
}

/** @internal */
export function findPreset(dimension: Dimension) {
    return dimensionPreset.find((d) => isSameDimension(d, dimension))
}

export function getPreset(preset: SteganographyPreset): Preset {
    if (preset === SteganographyPreset.Preset2021) return Preset2021
    if (preset === SteganographyPreset.Preset2022) return Preset2022
    if (preset === SteganographyPreset.Preset2023) return Preset2023
    if (preset === SteganographyPreset.Preset2023_Firefly) return Preset2023_Firefly
    unreachable(preset)
}

function isSameDimension(dimension: Dimension, otherDimension: Dimension) {
    return dimension.width === otherDimension.width && dimension.height === otherDimension.height
}
