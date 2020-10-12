import React, { useRef } from 'react'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { useQRCodeVideoScan } from '../../../utils/hooks/useQRCodeVideoScan'

export interface QRCodeVideoScannerProps {
    scanning: boolean
    deviceId?: string
    onScan?: (value: string) => void
    onError?: () => void
    onQuit?: () => void
}

export function QRCodeVideoScanner({
    scanning,
    deviceId,
    onScan,
    onError,
    onQuit,
    ...props
}: QRCodeVideoScannerProps & React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useQRCodeVideoScan(videoRef, scanning, deviceId, onScan, onError)
    return hasWKWebkitRPCHandlers ? (
        <WKWebkitQRScanner onScan={onScan} onQuit={onQuit} />
    ) : (
        <div style={{ position: 'relative' }}>
            <video style={{ minWidth: 404 }} aria-label="QR Code scanner" ref={videoRef} {...props} />
        </div>
    )
}
