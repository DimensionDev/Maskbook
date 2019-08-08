/// <reference path="./ShapeDetectionSpec.d.ts" />
import { isNull } from 'lodash-es'

const noop = () => {}

class BarcodeDetectorPolyfill implements BarcodeDetector {
    private worker: Worker = new Worker(browser.runtime.getURL('js/qrcode.js'))
    private onWorkerMessage: (ev: MessageEvent) => void = noop
    private onWorkerError: (err: ErrorEvent) => void = noop

    constructor() {
        this.worker.addEventListener('message', ev => this.onWorkerMessage.call(this.worker, ev))
        this.worker.addEventListener('error', err => this.onWorkerError.call(this.worker, err))
    }
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
            this.onWorkerMessage = (ev: MessageEvent) => {
                if (isNull(ev.data)) {
                    resolve([])
                    return
                }
                const result = new DetectedBarcodePolyfill()
                result.rawValue = ev.data.data
                resolve([result])
            }
            this.onWorkerError = (err: ErrorEvent) => {
                resolve([])
            }
        }).then(detected => {
            this.onWorkerMessage = noop
            this.onWorkerError = noop
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

if (!('BarcodeDetector' in window)) {
    Object.assign(window, {
        BarcodeDetector: BarcodeDetectorPolyfill,
        DetectedBarcode: DetectedBarcodePolyfill,
    })
}
