import React, { useRef, useEffect } from 'react'
import { useAsync } from 'react-use'
import qr from 'qrcode'
import { iOSHost } from '../../utils/iOS-RPC'

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

export function QRCode(props: {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement & HTMLImageElement>,
        HTMLCanvasElement & HTMLImageElement
    >
}) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    const image = cache.get(props.text)
    useEffect(() => {
        if (cache.get(props.text) || !ref.current) return
        qr.toCanvas(ref.current, props.text, props.options)
        return () => {
            // if already rendered canvas, do not re-render img
            // eslint-disable-next-line react-hooks/exhaustive-deps
            cache.set(props.text, ref.current?.toDataURL())
        }
    }, [props.options, props.text])
    return image ? <img src={image} {...props.canvasProps} /> : <canvas {...props.canvasProps} ref={ref} />
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
