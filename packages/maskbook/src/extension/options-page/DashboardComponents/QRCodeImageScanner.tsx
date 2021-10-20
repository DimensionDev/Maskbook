import { useRef, useEffect } from 'react'
import { useQRCodeImageScan } from '../../../utils/hooks/useQRCodeImageScan'
import { CircularProgress } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    progress: {
        maxWidth: 64,
        maxHeight: 64,
        position: 'absolute',
    },
    img: {
        maxWidth: 64,
        maxHeight: 64,
    },
})

export interface QRCodeImageScanner
    extends React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    src: string
    onScan?: (value: string) => void
    onError?: () => void
}

export function QRCodeImageScanner({ src, onScan, onError }: QRCodeImageScanner) {
    const { classes } = useStyles()
    const imageRef = useRef<HTMLImageElement | null>(null)
    const { value, loading, error } = useQRCodeImageScan(imageRef)

    // invoke scan result callbacks
    useEffect(() => {
        if (!src || loading) return
        if (error) onError?.()
        else onScan?.(value ?? '')
    }, [src, loading, value, error, onError, onScan])
    return (
        <>
            <img className={classes.img} ref={imageRef} src={src} />
            {loading ? <CircularProgress className={classes.progress} color="primary" /> : null}
        </>
    )
}
