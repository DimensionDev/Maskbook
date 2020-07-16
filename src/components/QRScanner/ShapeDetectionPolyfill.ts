/// <reference path="./ShapeDetectionSpec.d.ts" />
import { isNull } from 'lodash-es'
import Services from '../../extension/service'

class BarcodeDetectorPolyfill implements BarcodeDetector {
    public async detect(mediaSource: HTMLVideoElement) {
        const canvas = document.createElement('canvas')
        const resizedWidth = Math.min(mediaSource.videoWidth, 500)
        const resizedHeight = Math.floor((resizedWidth * mediaSource.videoHeight) / mediaSource.videoWidth)
        ;[canvas.width, canvas.height] = [resizedWidth, resizedHeight]
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')
        ctx.drawImage(
            mediaSource,
            0,
            0,
            mediaSource.videoWidth,
            mediaSource.videoHeight,
            0,
            0,
            canvas.width,
            canvas.height,
        )
        const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const decoded = await Services.QRCode.decode({
            width,
            height,
            data: Array.from(data),
        })
        if (decoded) {
            const result = new DetectedBarcodePolyfill()
            result.rawValue = decoded
            return [result]
        }
        return []
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
