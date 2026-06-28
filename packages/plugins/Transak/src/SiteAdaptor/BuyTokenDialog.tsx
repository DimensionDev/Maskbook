import { InjectedDialog } from '@masknet/shared'
import { Close as CloseIcon } from '@mui/icons-material'
import { DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useTransakWidgetURL } from '../hooks/useTransakWidgetURL.js'

const useStyles = makeStyles()((theme) => ({
    dialogPaper: {
        width: '500px !important',
        overflow: 'inherit',
    },
    dialogContent: {
        padding: '0 !important',
    },
    close: {
        color: `${theme.palette.common.white} !important`,
        backgroundColor: `${theme.palette.maskColor.dark} !important`,
        top: theme.spacing(-2),
        right: theme.spacing(-2),
        position: 'absolute',
    },
    content: {
        width: '100%',
        padding: 0,
        backgroundColor: theme.palette.common.white,
        position: 'relative',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflow: 'inherit',
        borderRadius: 12,
    },
    frame: {
        display: 'block',
        width: '100%',
        height: 630,
        border: 0,
        borderRadius: 12,
    },
    status: {
        height: 630,
        padding: theme.spacing(2),
        boxSizing: 'border-box',
    },
}))

interface BuyTokenDialogProps extends withClasses<'root'> {
    code: string
    address: string
    open: boolean
    onClose(): void
}

export function BuyTokenDialog(props: BuyTokenDialogProps) {
    const { classes } = useStyles(undefined, { props })
    const { code, address, open, onClose } = props

    const {
        data: widgetUrl,
        isLoading: loading,
        error,
    } = useTransakWidgetURL({
        defaultCryptoCurrency: code,
        walletAddress: address,
    })

    return (
        <div className={classes.root}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{
                    paper: classes.dialogPaper,
                    dialogContent: classes.dialogContent,
                }}
                disableBackdropClick>
                <DialogContent className={classes.content}>
                    <IconButton className={classes.close} size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                    {loading ?
                        <Stack className={classes.status} alignItems="center" justifyContent="center">
                            <LoadingBase size={36} />
                        </Stack>
                    : error || !widgetUrl ?
                        <Stack className={classes.status} alignItems="center" justifyContent="center">
                            <Typography variant="body1">
                                Transak is temporarily unavailable. Please try again later.
                            </Typography>
                        </Stack>
                        // eslint-disable-next-line react/dom/no-missing-iframe-sandbox
                    :   <iframe className={classes.frame} src={widgetUrl} allow="camera;microphone;payment" />}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
