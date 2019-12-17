import React from 'react'
import qr from 'qrcode'
import { useRef, useEffect } from 'react'

export function QrCode(props: {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
}) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    useEffect(() => {
        if (!ref.current) return
        qr.toCanvas(ref.current, props.text, props.options)
    }, [props.options, props.text])
    return <canvas {...props.canvasProps} ref={ref} />
}
