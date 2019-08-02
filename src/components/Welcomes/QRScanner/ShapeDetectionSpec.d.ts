declare class BarcodeDetector {
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
    BarcodeDetector: BarcodeDetector
    DetectedBarcode: DetectedBarcode
}
