/// <reference path="./ShapeDetection.d.ts" />
import * as React from 'react'
import { useRef, useState } from 'react'
import { useQRCodeScan } from '../../../utils/hooks/useQRCodeScan'

interface Props {
    scanning: boolean
    onResult(data: string): void
    onError(): void
    width: number
    height: number
}
export default function QRScanner(props: Props) {
    const { scanning, onResult, height, width, onError } = props

    const video = useRef<HTMLVideoElement | null>(null)

    useQRCodeScan(video, scanning, onResult, onError)
    return (
        <>
            <video ref={video} width={width} height={height} aria-label="QR Code scanner" />
        </>
    )
}
