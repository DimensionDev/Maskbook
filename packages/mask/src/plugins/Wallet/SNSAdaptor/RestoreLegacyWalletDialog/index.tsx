import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useHistory } from 'react-router-dom'
import { useRemoteControlledDialog } from '@masknet/shared'
import { Box } from '@mui/system'
import { makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Button, DialogContent, Typography } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { WalletMessages, WalletRPC } from '../../messages'

const useStyles = makeStyles()((theme) => ({
    content: {},
    button: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
    title: {
        display: 'block',
    },
}))

export interface RestoreLegacyWalletDialogProps {}

export function RestoreLegacyWalletDialog(props: RestoreLegacyWalletDialogProps) {
    const { classes } = useStyles()
    const history = useHistory()
    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.restoreLegacyWalletDialogUpdated)

    const onClose = useCallback(() => {
        setDialog({ open: false })
    }, [setDialog])

    const { value: legacyWallets = [] } = useAsyncRetry(async () => {
        const now = new Date()
        const wallets = await WalletRPC.getLegacyWallets(ProviderType.MaskWallet)
        if (!wallets.length) return []
        return wallets.filter((x) => (x.mnemonic || x._public_key_) && x.updatedAt < now)
    }, [])

    useEffect(() => {
        if (!legacyWallets.length) return
        if (!location.href.includes('popups.html')) return
        if (location.hash.includes('wallet/legacy-recovered')) return
        setDialog({ open: true })
    }, [legacyWallets.map((x) => x.address).join()])

    const onRestore = useCallback(async () => {
        history.push(PopupRoutes.LegacyWalletRecovered)
        onClose()
    }, [onClose, history])

    return (
        <InjectedDialog open={open} maxWidth="xs" onClose={onClose}>
            <DialogContent className={classes.content}>
                <Typography className={classes.title} color="textPrimary" variant="body2" component="div">
                    Detected legacy wallets, please click confirm to restore them all.
                </Typography>
                <Box display="flex" justifyContent="center">
                    <Button variant="contained" onClick={onRestore} sx={{ marginTop: 2 }}>
                        Confirm
                    </Button>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
