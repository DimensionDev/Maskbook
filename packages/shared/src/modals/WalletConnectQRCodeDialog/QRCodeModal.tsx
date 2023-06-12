import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { QRCode, useSharedI18N } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.1))',
        backdropFilter: 'blur(20px)',
    },
    tip: { fontSize: 12, marginTop: '10px' },
}))

interface QRCodeModalProps {
    uri: string
}

export const QRCodeModal = ({ uri }: QRCodeModalProps) => {
    const t = useSharedI18N()
    const { classes } = useStyles()

    const style: React.CSSProperties = {
        width: '80%',
        maxWidth: 361,
        display: 'block',
        margin: 'auto',
        borderRadius: 16,
    }

    return (
        <Grid className={classes.container}>
            <QRCode text={uri} canvasProps={{ style }} />
            <Typography className={classes.tip} color="textSecondary">
                {t.wallet_connect_qr_code_dialog_content()}
            </Typography>
        </Grid>
    )
}
