import React, { useRef } from 'react'
import { makeStyles, createStyles, Typography } from '@material-ui/core'
import { DashboardDialogCore, WrappedDialogProps } from '../Dialogs/Base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { useQRCodeScan } from '../../../utils/hooks/useQRCodeScan'

interface QRScannerProps {
    scanning: boolean
    onScan: (value: string) => void
    onError: () => void
    onQuit: () => void
}

function QRScanner({ scanning, onScan, onError, onQuit }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    useQRCodeScan(videoRef, scanning, onScan, onError)

    return hasWKWebkitRPCHandlers ? (
        <WKWebkitQRScanner onScan={onScan} onQuit={onQuit} />
    ) : (
        <video style={{ minWidth: 404 }} ref={videoRef} aria-label="QR Code scanner" />
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'relative',
        },
        wrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            overflow: 'hidden',
        },
        title: {
            fontSize: 20,
            fontWeight: 500,
            textAlign: 'center',
            top: 32,
            left: 0,
            right: 0,
            margin: 'auto',
            position: 'absolute',
        },
        closeButton: {
            margin: 'auto',
            width: 28 * 1.2,
            height: 28 * 1.2,
            left: 0,
            right: 0,
            bottom: 42,
            position: 'absolute',
        },
        closeIcon: {
            color: theme.palette.common.white,
            width: 28,
            height: 28,
        },
    }),
)

interface QRCodeScannerDialogProps {
    onScan: (val: string) => void
    onError: () => void
}

export function QRCodeScannerDialog(props: WrappedDialogProps) {
    const { open, onClose } = props
    const { onScan, onError } = props.ComponentProps! as QRCodeScannerDialogProps

    const { t } = useI18N()
    const classes = useStyles()

    return (
        <DashboardDialogCore
            {...props}
            CloseIconProps={{ className: classes.closeIcon }}
            CloseButtonProps={{ className: classes.closeButton }}>
            <div className={classes.wrapper}>
                {open ? <QRScanner scanning={open} onScan={onScan} onError={onError} onQuit={onClose} /> : null}
                <Typography className={classes.title} variant="h1">
                    {t('set_up_qr_scanner_title')}
                </Typography>
            </div>
        </DashboardDialogCore>
    )
}
