import jsQR from 'jsqr'
import { isNull } from 'lodash-es'

export class BarcodeDetector {
    // noinspection JSUnusedLocalSymbols
    /**
     * At this time we only support qr_code
     */
    constructor(options: { formats: ['qr_code'] }) {
    }

    // noinspection JSMethodCanBeStatic
    public async detect(mediaSource: CanvasImageSource): Promise<DetectedBarcode[]> {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [1280, 720]
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) {
            throw new Error('Canvas was not supported')
        }
        ctx.drawImage(mediaSource, 0, 0)
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const res = jsQR(d.data, canvas.width, canvas.height)
        console.log(res);
        if (isNull(res)) {
            return []
        }
        return [{
            format: 'qr_code',
            rawValue: res.data,
        }]
    }
}

interface DetectedBarcode {
    // boundingBox: DOMRectReadOnly
    // cornerPoints: { x: number; y: number }[]
    format: 'qr_code'
    rawValue: string
}
