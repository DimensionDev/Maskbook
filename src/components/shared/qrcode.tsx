import React from 'react'
import qr from 'qrcode'
import { useRef, useEffect } from 'react'

const cache = new Map()

export function QrCode(props: {
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
            cache.set(props.text, ref.current?.toDataURL())
        }
    }, [props.options, props.text])
    return image ? <img src={image} {...props.canvasProps}></img> : <canvas {...props.canvasProps} ref={ref} />
}
