/// <reference path="./ShapeDetectionSpec.d.ts" />
// @ts-ignore
import Detector from 'barcode-detector'

async function polyfill() {
    if (typeof window !== 'object') return
    const global = globalThis as typeof window
    try {
        const supportedTypes = await BarcodeDetector.getSupportedFormats()
        if (supportedTypes.includes('qr_code')) return
        delete global.BarcodeDetector
    } catch (e) {}
    if (typeof BarcodeDetector === 'undefined') {
        global.BarcodeDetector = Detector
    }
}
polyfill().catch(console.error)
