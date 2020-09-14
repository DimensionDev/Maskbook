import React, { useRef, useEffect } from 'react'
import { useAsync } from 'react-use'
import qr from 'qrcode'
import { iOSHost } from '../../utils/iOS-RPC'

interface QRProps {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement & HTMLImageElement>,
        HTMLCanvasElement & HTMLImageElement
    >
}

const cache = new Proxy(sessionStorage, {
    get(t, p: 'get' | 'set') {
        return {
            get(key: string) {
                return t.getItem(`qrcode:${key}`)
            },
            set(key: string, value: string) {
                return t.setItem(`qrcode:${key}`, value)
            },
        }[p]
    },
})

export function QRCode({ text, options = {}, canvasProps }: QRProps) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    const image = cache.get(text)
    useEffect(() => {
        if (!ref.current) return

        qr.toCanvas(ref.current, text, options, () => {
            if (ref.current?.toDataURL()) {
                cache.set(text, ref.current?.toDataURL())
            }
        })
    }, [options, text])
    return image ? <img src={image} {...canvasProps} /> : <canvas {...canvasProps} ref={ref} />
}

export function WKWebkitQRScanner(props: { onScan?: (val: string) => void; onQuit?: () => void }) {
    useAsync(async () => {
        try {
            props.onScan?.(await iOSHost.scanQRCode())
        } catch (e) {
            props.onQuit?.()
        }
    })
    return null
}
