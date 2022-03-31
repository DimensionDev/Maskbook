import { useCallback, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { Box } from '@mui/system'
import { makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Button, DialogContent, Typography } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { WalletMessages, WalletRPC } from '../../messages'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
    title: {
        display: 'block',
    },
}))

export function RestoreLegacyWalletDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    // const navigate = useNavigate()
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
        if (location.hash.includes(PopupRoutes.LegacyWalletRecovered) || location.hash.includes(PopupRoutes.Unlock))
            return
        setDialog({ open: true })
    }, [legacyWallets.map((x) => x.address).join()])

    const onRestore = useCallback(async () => {
        // !!! invalid navigation !!!
        // navigate(PopupRoutes.LegacyWalletRecovered)
        onClose()
    }, [onClose, history])

    return (
        <InjectedDialog open={open} maxWidth="xs" onClose={onClose}>
            <DialogContent>
                <Typography className={classes.title} color="textPrimary" variant="body2" component="div">
                    {t('popups_wallet_dialog_legacy_wallet_tip')}
                </Typography>
                <Box display="flex" justifyContent="center">
                    <Button variant="contained" onClick={onRestore} sx={{ marginTop: 2 }}>
                        {t('confirm')}
                    </Button>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
