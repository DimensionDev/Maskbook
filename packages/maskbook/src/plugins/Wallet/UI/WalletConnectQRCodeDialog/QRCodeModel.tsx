import { Button, createStyles, Grid, makeStyles, Typography } from '@material-ui/core'
import { useCopyToClipboard } from 'react-use'
import { QRCode } from '../../../../components/shared/qrcode'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        tip: { fontSize: 14, marginBottom: theme.spacing(2) },
        onCopy: { marginTop: theme.spacing(1) },
    }),
)

export const QRCodeModel: React.FC<{ uri: string }> = ({ uri }) => {
    const { t } = useI18N()
    const classes = useStyles()

    //#region copy to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(async () => uri && copyToClipboard(uri), [uri])
    //#endregion

    const style = { height: '80%', display: 'block', margin: 'auto' }
    return (
        <Grid className={classes.container}>
            <Typography className={classes.tip} color="textSecondary">
                {t('plugin_wallet_qr_code_with_wallet_connect')}
            </Typography>
            <QRCode text={uri} options={{ width: 400 }} canvasProps={{ style }} />
            <Button className={classes.onCopy} color="primary" variant="text" onClick={onCopy}>
                {t('copy_to_clipboard')}
            </Button>
        </Grid>
    )
}
