import { loadImage } from '@dimensiondev/kit'
import { useRef, useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useQRCodeImageScan(image: React.MutableRefObject<HTMLImageElement | null>): AsyncState<string> {
    const scanner = useRef(new BarcodeDetector({ formats: ['qr_code'] }))
    const [source, setSource] = useState('')

    useEffect(() => {
        const node = image.current
        if (node) {
            node.addEventListener('load', () => setSource(node?.getAttribute('src') ?? ''))
            node.addEventListener('error', () => setSource(''))
        } else {
            setSource('')
        }
    }, [image])
    return useAsync(async () => {
        const image = await loadImage(source)
        const [{ rawValue }] = await scanner.current.detect(image)
        return rawValue
    }, [source, scanner.current])
}
