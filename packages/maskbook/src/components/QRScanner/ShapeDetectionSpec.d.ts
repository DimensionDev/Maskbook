declare class BarcodeDetector {
    static getSupportedFormats(): Promise<string[]>
    constructor(options: { formats: string[] })
    public async detect(mediaSource: CanvasImageSource): Promise<DetectedBarcode[]>
}
declare class DetectedBarcode {
    boundingBox: DOMRectReadOnly
    cornerPoints: { x: number; y: number }[]
    format: string
    rawValue: string
}

interface Window {
    BarcodeDetector?: typeof BarcodeDetector
    DetectedBarcode?: typeof DetectedBarcode
}
