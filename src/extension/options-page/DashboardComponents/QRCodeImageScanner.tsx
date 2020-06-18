import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useQRCodeImageScan } from '../../../utils/hooks/useQRCodeImageScan'
import { CircularProgress } from '@material-ui/core'

export interface QRCodeImageScanner
    extends React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    file: File | null
    onScan?: (value: string) => void
    onError?: () => void
}

export function QRCodeImageScanner({ file, onScan, onError }: QRCodeImageScanner) {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [dataURL, setDataURL] = useState('')
    const { value, loading, error } = useQRCodeImageScan(imageRef)

    // read file as data URL
    useEffect(() => {
        if (file) {
            const fr = new FileReader()
            fr.readAsDataURL(file)
            fr.addEventListener('loadend', () => setDataURL(fr.result as string))
            fr.addEventListener('error', () => setDataURL(''))
        } else {
            setDataURL('')
        }
    }, [file])

    // invoke scan result callbacks
    useEffect(() => {
        if (loading) return
        if (error) onError?.()
        else onScan?.(value ?? '')
    }, [loading, value, error, onError, onScan])
    return (
        <>
            {loading ? <CircularProgress color="primary" style={{ maxWidth: 64, maxHeight: 64 }} /> : null}
            <img
                ref={imageRef}
                src={dataURL}
                style={{ maxWidth: 64, maxHeight: 64, display: !file || loading ? 'none' : 'block' }}
            />
        </>
    )
}
