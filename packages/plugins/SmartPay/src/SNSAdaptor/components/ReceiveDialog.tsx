import { QRCode } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        maxWidth: 320,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    title: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
}))

export const ReceiveDialog = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.receiveDialogEvent, (ev) => {
        if (!ev.open) return
        if (ev.address) setAddress(ev.address)
    })

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={closeDialog} classes={{ paper: classes.paper }}>
            <DialogTitle sx={{ py: 3 }}>
                <Typography className={classes.title}>Title</Typography>
            </DialogTitle>
            <DialogContent>
                <QRCode text={`${Others?.chainResolver.chainPrefix(ChainId.Mumbai)}:${address}`} />
                <Typography>{t.scan_address_to_payment()}</Typography>
            </DialogContent>
        </Dialog>
    ))
})
