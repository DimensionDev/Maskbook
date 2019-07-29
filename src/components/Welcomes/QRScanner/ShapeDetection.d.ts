class BarcodeDetector {
    constructor(options: { formats: string[] })
    detect(mediaSource: ImageBitmapSource): Promise<DetectedBarcode[]>
}
class DetectedBarcode {
    boundingBox: DOMRectReadOnly
    cornerPoints: { x: number; y: number }[]
    format: string
    rawValue: string
}
