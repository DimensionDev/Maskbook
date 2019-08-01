import jsQR from 'jsqr'
import { isNull, isUndefined } from 'lodash-es'

/**
 * TODO: the polyfill was not strictly same as future one.
 */
export class BarcodeDetector {
    // noinspection JSUnusedLocalSymbols
    /**
     * At this time we only support qr_code
     */
    constructor(options: { formats: ['qr_code'] }) {
    }

    // noinspection JSMethodCanBeStatic
    public async detect(mediaSource: CanvasImageSource): Promise<string[]> {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [1920, 1080]
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
        return [res.data]
    }
}

// @ts-ignore
if (isUndefined(window.BarcodeDetector)) {
    // @ts-ignore
    window.BarcodeDetector = BarcodeDetector
}
