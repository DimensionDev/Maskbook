import React from 'react'
import qr from 'qrcode'
import { useRef, useEffect } from 'react'
export function QrCode(props: { text: string }) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    useEffect(() => {
        if (!ref.current) return
        qr.toCanvas(ref.current, props.text)
    }, [props.text])
    return <canvas ref={ref} />
}
