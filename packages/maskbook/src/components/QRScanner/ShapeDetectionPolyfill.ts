/// <reference path="./ShapeDetectionSpec.d.ts" />
import { isNull } from 'lodash-es'
import { startEffect } from '../../utils/side-effects'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'

let worker: OnDemandWorker
startEffect(import.meta.webpackHot, () => {
    const _w = (worker = new OnDemandWorker(new URL('../../web-workers/QRCode.ts', import.meta.url), {
        name: 'ShapeDetection',
    }))
    return () => _w.terminate()
})

class BarcodeDetectorPolyfill implements BarcodeDetector {
    public async detect(mediaSource: CanvasImageSource) {
        const canvasImageWidth = (mediaSource as HTMLVideoElement).videoWidth
        const canvasImageHeight = (mediaSource as HTMLVideoElement).videoHeight
        if (!canvasImageWidth || !canvasImageHeight) return []
        const canvas = document.createElement('canvas')
        const resizedWidth = Math.min(canvasImageWidth, 500)
        const resizedHeight = Math.floor((resizedWidth * canvasImageHeight) / canvasImageWidth)
        ;[canvas.width, canvas.height] = [resizedWidth, resizedHeight]
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')
        ctx.drawImage(mediaSource, 0, 0, canvasImageWidth, canvasImageHeight, 0, 0, canvas.width, canvas.height)
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height)
        return new Promise<DetectedBarcode[]>((resolve) => {
            worker.postMessage([d.data, canvas.width, canvas.height])
            worker.addEventListener(
                'message',
                (ev: MessageEvent) => {
                    if (isNull(ev.data)) {
                        resolve([])
                        return
                    }
                    const result = new DetectedBarcodePolyfill()
                    result.rawValue = ev.data.data
                    resolve([result])
                },
                { once: true },
            )
            worker.addEventListener('error', () => resolve([]))
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

Object.assign(globalThis, {
    BarcodeDetector: BarcodeDetectorPolyfill,
    DetectedBarcode: DetectedBarcodePolyfill,
})
