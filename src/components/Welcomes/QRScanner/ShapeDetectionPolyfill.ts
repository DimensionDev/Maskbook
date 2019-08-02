import jsQR from 'jsqr'
import { isNull } from 'lodash-es'
/// <reference path="./ShapeDetectionSpec.d.ts" />

class BarcodeDetectorPolyfill implements BarcodeDetector {
    constructor() {}
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
        const res = jsQR(d.data, canvas.width, canvas.height)
        if (isNull(res)) {
            return []
        }
        const result = new DetectedBarcodePolyfill()
        result.rawValue = res.data
        return [result]
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
