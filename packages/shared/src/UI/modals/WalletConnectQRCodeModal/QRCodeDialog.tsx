import { DialogContent, dialogClasses, Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { QRCode } from 'react-qrcode-logo'
import { InjectedDialog, useSharedTrans } from '@masknet/shared'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        dialog: {
            [`.${dialogClasses.paper}`]: {
                height: 563,
                width: 600,
            },
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        halo: {
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            width: '100%',
            '&:before': {
                position: 'absolute',
                left: 30,
                top: 10,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
            },
            '&:after': {
                position: 'absolute',
                right: 30,
                top: 20,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage: 'radial-gradient(50% 50% at 50% 50%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
            },
        },
        grid: {
            width: 393,
            margin: theme.spacing(0, 'auto'),
            padding: theme.spacing(2),
            boxSizing: 'border-box',
            backgroundColor: theme.palette.maskColor.bottom,
            position: 'relative',
            zIndex: 10,
        },
        qrcode: {
            width: 361,
            height: 361,
            boxShadow: theme.palette.maskColor.bottomBg,
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
        },
        tip: {
            fontSize: 12,
            marginTop: '10px',
            textAlign: 'center',
        },
    }
})
interface QRCodeDialogProps {
    uri: string
    open: boolean
    onClose(): void
}

export function QRCodeDialog({ uri, open, onClose }: QRCodeDialogProps) {
    const t = useSharedTrans()
    const { classes } = useStyles()
    return (
        <InjectedDialog
            className={classes.dialog}
            open={open}
            onClose={onClose}
            title={t.wallet_connect_qr_code_dialog_title()}>
            <DialogContent className={classes.container}>
                <div className={classes.halo}>
                    <Grid className={classes.grid}>
                        <div className={classes.qrcode}>
                            <QRCode value={uri} ecLevel="L" size={329} quietZone={16} eyeRadius={100} qrStyle="dots" />
                        </div>
                        <Typography className={classes.tip} color="textSecondary">
                            {t.wallet_connect_qr_code_dialog_content()}
                        </Typography>
                    </Grid>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
