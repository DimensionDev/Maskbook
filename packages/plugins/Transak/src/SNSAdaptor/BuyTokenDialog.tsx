import { useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent, IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Close as CloseIcon } from '@mui/icons-material'
import { useTransakURL } from '../hooks/useTransakURL.js'
import { PluginTransakMessages } from '../messages.js'

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
}))

export interface BuyTokenDialogProps extends withClasses<'root'> {}

export function BuyTokenDialog(props: BuyTokenDialogProps) {
    const { classes } = useStyles(undefined, { props })

    const [code, setCode] = useState('ETH')
    const [address, setAddress] = useState('')
    const transakURL = useTransakURL({
        defaultCryptoCurrency: code,
        walletAddress: address,
    })

    // #region remote controlled buy token dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setCode(ev.code ?? 'ETH')
        setAddress(ev.address)
    })
    // #endregion

    return (
        <div className={classes.root}>
            <InjectedDialog
                open={open}
                onClose={closeDialog}
                classes={{
                    paper: classes.dialogPaper,
                    dialogContent: classes.dialogContent,
                }}
                disableBackdropClick>
                <DialogContent className={classes.content}>
                    <IconButton className={classes.close} size="small" onClick={closeDialog}>
                        <CloseIcon />
                    </IconButton>
                    {transakURL ? <iframe className={classes.frame} src={transakURL} /> : null}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
