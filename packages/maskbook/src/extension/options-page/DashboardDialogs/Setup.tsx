import { makeStyles, Typography } from '@material-ui/core'
import { DashboardDialogCore, WrappedDialogProps } from './Base'
import { useI18N, delay } from '../../../utils'
import { QRCodeVideoScanner } from '../DashboardComponents/QRCodeVideoScanner'

const useStyles = makeStyles((theme) => ({
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
}))

interface QRCodeVideoScannerDialogProps {
    deviceId?: string
    onScan?: (val: string) => void
    onError?: () => void
}

export function QRCodeVideoScannerDialog(props: WrappedDialogProps) {
    const { open, onClose } = props
    const { deviceId, onScan, onError } = props.ComponentProps! as QRCodeVideoScannerDialogProps

    const { t } = useI18N()
    const classes = useStyles()

    return (
        <DashboardDialogCore
            {...props}
            CloseIconProps={{ className: classes.closeIcon }}
            CloseButtonProps={{ className: classes.closeButton }}>
            <div className={classes.wrapper}>
                {open ? (
                    <QRCodeVideoScanner
                        scanning={open}
                        onScan={async (data: string) => {
                            onClose()
                            // ensure blur mask closed
                            await delay(300)
                            onScan?.(data)
                        }}
                        deviceId={deviceId}
                        onError={onError}
                        onQuit={onClose}
                    />
                ) : null}
                <Typography className={classes.title} variant="h1">
                    {t('set_up_qr_scanner_title')}
                </Typography>
            </div>
        </DashboardDialogCore>
    )
}
