import { DecodeOptions, EncodeOptions, getImageType } from '@dimensiondev/stego-js'
import { preprocessImage } from '@dimensiondev/stego-js/esm/utils/image'
import type { AsyncCallOptions } from 'async-call-rpc'
import { AsyncCall } from 'async-call-rpc/full'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { serialization } from '../../../utils/type-transform/Serialization'
import { OnDemandWorker } from '../../../web-workers/OnDemandWorker'

export let StegoWorker: OnDemandWorker | undefined

if (process.env.architecture) {
    __webpack_public_path__ = browser.runtime.getURL('/')
    StegoWorker = new OnDemandWorker(new URL('./worker.ts', import.meta.url), { name: 'StegoWorker' })
}

const options: AsyncCallOptions = {
    channel: new WorkerChannel(StegoWorker),
    serializer: serialization,
}

const StegoAPI = AsyncCall<typeof import('./worker-implementation')>({}, options)

export async function encode(image: ArrayBuffer, mask: ArrayBuffer, options: EncodeOptions) {
    const { data, height, width } = await StegoAPI.encode(
        cutImage(await toImageData(image)),
        cutImage(await toImageData(mask)),
        options,
    )
    return toBuffer(data, height, width)
}

export async function decode(image: ArrayBuffer, mask: ArrayBuffer, options: DecodeOptions) {
    return StegoAPI.decode(await toImageData(image), await toImageData(mask), options)
}

function cutImage(data: ImageData) {
    // prettier-ignore
    return preprocessImage(data, (w, h) =>
        createCanvas(w, h)
            .getContext('2d')
            ?.createImageData(w, h)
            ?? null
    )
}

function toImageData(data: ArrayBuffer) {
    const type = getImageType(new Uint8Array(data.slice(0, 8)))
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    return new Promise<ImageData>((resolve, reject) => {
        const element = new Image()
        element.addEventListener('load', () => {
            const { width, height } = element
            const ctx = createCanvas(width, height).getContext('2d')!
            ctx.drawImage(element, 0, 0, width, height)
            resolve(ctx.getImageData(0, 0, width, height))
        })
        element.addEventListener('error', reject)
        element.src = url
    })
}

function toBuffer(imgData: ImageData, height: number, width: number): Promise<ArrayBuffer> {
    const canvas = createCanvas(width, height)
    canvas.getContext('2d')!.putImageData(imgData, 0, 0, 0, 0, width, height)
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const callback: BlobCallback = (blob) => {
            if (blob) {
                resolve(blob.arrayBuffer())
            } else {
                reject(new Error('fail to generate array buffer'))
            }
        }
        canvas.toBlob(callback, 'image/png')
    })
}

function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}
