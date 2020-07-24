import seedrandom from 'seedrandom'
import { decodeArrayBuffer, encodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { downloadUrl } from '../../utils/utils'
import { buf2Img, img2Buf } from '@dimensiondev/stego-js/cjs/canvas/dom'

const DEFAULT_BLOCK_WIDTH = 8
const BytesInPixel = 4
const optimalWidth = 1280 // https://louisem.com/1730/how-to-optimize-photos-for-facebook#:~:text=According%20to%20Facebook%2C%20they%20will,NOT%20be%20reduced%20in%20size.

// TODO: might want to move this somewhere more appropriate
const rand = (min: number, max: number, prng: CallableFunction) => {
    // it is important that the number of states of the pseudo-random number generator is >> (much greater) than the number of states for which it generates the random values
    // for example, using pseudo random number generator that has 2 ** 32 states is a bad idea to generate all the permutations of the 52 playing deck of cards, since the latter has 2 ** 225.6! states
    // scrolls to the PRNG section here: https://www.wikiwand.com/en/Fisher%E2%80%93Yates_shuffle
    const randomNum = prng() * (max - min) + min
    return Math.round(randomNum)
}

interface BlockStartOptions {
    blockIx: number
    imgWidth: number
    blockWidth: number
}

const blockStart = ({ blockIx, imgWidth, blockWidth }: BlockStartOptions) => {
    const blockCols = imgWidth / blockWidth
    return (
        Math.floor(blockIx / blockCols) * blockCols * BytesInPixel * blockWidth * blockWidth +
        BytesInPixel * (blockIx % blockCols) * blockWidth
    )
}

interface SwapPixelBlocksOptions {
    blockWidth: number
    blockIx1: number
    blockIx2: number
}

const swapPixelBlocks = (imageData: ImageData, { blockWidth, blockIx1, blockIx2 }: SwapPixelBlocksOptions) => {
    const blockStartIx1 = blockStart({ blockIx: blockIx1, imgWidth: imageData.width, blockWidth })
    const blockStartIx2 = blockStart({ blockIx: blockIx2, imgWidth: imageData.width, blockWidth })
    const widthDelta = imageData.width - blockWidth
    const blockPixelArea = blockWidth * blockWidth

    for (var k = 0; k < BytesInPixel * blockPixelArea; k = k + 1) {
        const lambda = BytesInPixel * Math.floor(k / (BytesInPixel * blockWidth))
        const copyToIx = blockStartIx1 + k + lambda * widthDelta
        const copyFromIx = blockStartIx2 + k + lambda * widthDelta
        const tmp = imageData.data[copyToIx]
        imageData.data[copyToIx] = imageData.data[copyFromIx]
        imageData.data[copyFromIx] = tmp
    }
}

export interface ShuffleOptions {
    seed: string
    blockWidth?: number
}

export async function shuffle(buf: string | ArrayBuffer, { seed, blockWidth = DEFAULT_BLOCK_WIDTH }: ShuffleOptions) {
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    const imageData = await buf2Img(_buf)
    const { width, height } = imageData
    if (width < blockWidth) throw new Error('blockWidth is larger than image width')

    // if (width > optimalWidth) {
    //     const aspectRatio = width / height
    //     const targetHeight = optimalWidth / aspectRatio
    //     file.resize(optimalWidth - (optimalWidth % blockWidth), targetHeight - (targetHeight % blockWidth))
    // } else {
    //     // TODO: you might want to avoid the throws
    //     if (width < blockWidth) {
    //         throw new Error('blockWidth is larger than image width')
    //     }
    //     // * you can still get an image with a ridiculous height
    //     file.resize(width - (width % blockWidth), height - (height % blockWidth))
    // }

    const aspectRatio = width / height
    const targetHeight = optimalWidth / aspectRatio
    const imgWidth = width > optimalWidth ? optimalWidth - (optimalWidth % blockWidth) : width - (width % blockWidth)
    const imgHegiht = width > optimalWidth ? targetHeight - (targetHeight % blockWidth) : height - (height % blockWidth)
    const totalBlocksNum = (width * height) / (blockWidth * blockWidth) // this will be a whole number, because we resize earlier
    const prng = seedrandom(seed)
    for (var blockNum = totalBlocksNum - 1; blockNum > 1; blockNum = blockNum - 1) {
        const r = rand(0, blockNum - 1, prng) // might need to use rand(0, blockNum) depending on what the "off-by-one" error means
        swapPixelBlocks(imageData, { blockWidth, blockIx1: blockNum, blockIx2: r })
    }
    return encodeArrayBuffer(await img2Buf(imageData))
}

export interface DeshuffleOptions {
    blockWidth: number
    seed: string
}

export async function deshuffle(buf: ArrayBuffer, { blockWidth, seed }: DeshuffleOptions) {
    const _buf = typeof buf === 'string' ? decodeArrayBuffer(buf) : buf
    const imageData = await buf2Img(_buf)
    const { width, height } = imageData
    const totalBlocksNum = (width * height) / (blockWidth * blockWidth) // this will be a whole number, because we resized earlier
    const prng = seedrandom(seed)

    for (var blockNum = 1; blockNum < totalBlocksNum; blockNum = blockNum + 1) {
        const swapWith = rand(0, totalBlocksNum - 1 - blockNum, prng)
        // ! there is an error here somewhere with an index. one block does not get copied over
        swapPixelBlocks(imageData, { blockWidth, blockIx1: swapWith, blockIx2: blockNum })
    }
}

export async function deshuffleImageUrl(url: string, options: DeshuffleOptions) {
    return deshuffle(await downloadUrl(url), options)
}
