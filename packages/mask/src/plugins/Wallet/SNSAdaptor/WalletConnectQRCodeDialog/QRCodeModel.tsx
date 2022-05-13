import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { QRCode } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tip: { fontSize: 14, marginBottom: theme.spacing(2) },
    onCopy: { marginTop: theme.spacing(1) },
}))

export const QRCodeModel: React.FC<{
    uri: string
}> = ({ uri }) => {
    const { t } = useI18N()

    const { classes } = useStyles()
    const style: React.CSSProperties = {
        width: '80%',
        display: 'block',
        margin: 'auto',
    }
    return (
        <Grid className={classes.container}>
            <QRCode text={uri} canvasProps={{ style }} />
            <Typography className={classes.tip} color="textSecondary">
                {t('plugin_wallet_qr_code_with_wallet_connect')}
            </Typography>
        </Grid>
    )
}
