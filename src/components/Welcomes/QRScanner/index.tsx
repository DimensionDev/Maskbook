/// <reference path="./ShapeDetection.d.ts" />
import * as React from 'react'
import { useRef, useState } from 'react'
import { useQRCodeScan } from '../../../utils/hooks/useQRCodeScan'

interface Props {
    scanning: boolean
    onResult(data: string): void
    onError(): void
}
export default function QRScanner(
    props: Props & React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>,
) {
    const { scanning, onResult, onError, ...videoProps } = props

    const video = useRef<HTMLVideoElement | null>(null)

    useQRCodeScan(video, scanning, onResult, onError)
    return (
        <>
            <video ref={video} aria-label="QR Code scanner" {...videoProps} />
        </>
    )
}
