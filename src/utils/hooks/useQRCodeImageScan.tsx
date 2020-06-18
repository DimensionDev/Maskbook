import React, { useRef, useState, useEffect } from 'react'
import { useAsync } from 'react-use'

export function useQRCodeImageScan(image: React.MutableRefObject<HTMLImageElement | null>) {
    const scanner = useRef(new BarcodeDetector({ formats: ['qr_code'] }))
    const [src, setSrc] = useState('')

    useEffect(() => {
        const node = image.current
        if (node) {
            node.onload = () => setSrc(node?.getAttribute('src') ?? '')
            node.onerror = () => setSrc('')
        } else {
            setSrc('')
        }
    }, [image])
    return useAsync(
        () =>
            new Promise<string>((resolve, reject) => {
                const fakeImage = new Image()
                fakeImage.onload = () =>
                    scanner.current
                        .detect(fakeImage)
                        .then(([result] = []) => resolve(result?.rawValue))
                        .catch(reject)
                fakeImage.onerror = reject
                if (src && fakeImage.src !== src) {
                    fakeImage.src = src
                }
            }),
        [src, scanner.current],
    )
}
