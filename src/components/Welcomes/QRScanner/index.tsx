/// <reference path="./ShapeDetectionPolyfill.ts" />
import * as React from 'react'
import { useRef, useState } from 'react'
import { useQRCodeScan } from '../../../utils/hooks/useQRCodeScan'
import { geti18nString } from '../../../utils/i18n'
import { Button } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import CheckIcon from '@material-ui/icons/Check'

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

    const [result, setResult] = useState('')

    function onQRResult(file: string) {
        if (video.current) {
            video.current.pause()
        }
        setResult(file)
    }

    function onRescanClicked() {
        setResult('')
        video.current!.play()
    }

    useQRCodeScan(video, scanning, onQRResult, onError)
    return (
        <div style={{ position: 'relative' }}>
            <video ref={video} aria-label="QR Code scanner" {...videoProps} />
            {result && (
                <div
                    style={{
                        background: 'rgba(255,255,255,0.3)',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                    }}>
                    <Button disableFocusRipple disableRipple onClick={() => onResult(result)}>
                        <CheckIcon />
                        {geti18nString('welcome_1b_qr_confirm')}
                    </Button>
                    <Button disableFocusRipple disableRipple onClick={onRescanClicked}>
                        <RefreshIcon />
                        {geti18nString('welcome_1b_qr_rescan')}
                    </Button>
                </div>
            )}
        </div>
    )
}
