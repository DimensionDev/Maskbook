/// <reference path="./ShapeDetectionSpec.d.ts" />
import { isNull } from 'lodash-es'
import { getUrl } from '../../utils/utils'

const noop = () => {}
const worker = new Worker(getUrl('js/qrcode.js'))

class BarcodeDetectorPolyfill implements BarcodeDetector {
    private worker: Worker = worker

    // noinspection JSMethodCanBeStatic
    public async detect(mediaSource: CanvasImageSource) {
        const canvas = document.createElement('canvas')
        ;[canvas.width, canvas.height] = [1920, 1080]
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) {
            throw new Error('Canvas was not supported')
        }
        ctx.drawImage(mediaSource, 0, 0)
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height)
        return new Promise<DetectedBarcode[]>(resolve => {
            this.worker.postMessage([d.data, canvas.width, canvas.height])
            this.worker.onmessage = (ev: MessageEvent) => {
                if (isNull(ev.data)) {
                    resolve([])
                    return
                }
                const result = new DetectedBarcodePolyfill()
                result.rawValue = ev.data.data
                resolve([result])
            }
            this.worker.onerror = (err: ErrorEvent) => {
                resolve([])
            }
        }).then(detected => {
            this.worker.onmessage = noop
            this.worker.onerror = noop
            return detected
        })
    }
}
class DetectedBarcodePolyfill implements DetectedBarcode {
    get boundingBox(): DOMRectReadOnly {
        throw new Error('Not implemented')
    }
    cornerPoints: { x: number; y: number }[] = []
    format = 'qr_code'
    rawValue!: string
}

if (!('BarcodeDetector' in globalThis)) {
    Object.assign(globalThis, {
        BarcodeDetector: BarcodeDetectorPolyfill,
        DetectedBarcode: DetectedBarcodePolyfill,
    })
}
