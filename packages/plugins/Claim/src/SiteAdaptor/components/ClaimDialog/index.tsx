import { InjectedDialog, PluginWalletStatusBar } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { DialogActions, DialogContent } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { AirDropActivities } from '../AirDropActivities/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: 0,
    },
}))

interface Props {
    open: boolean
    onClose(): void
}
export const ClaimDialog = memo(({ open, onClose }: Props) => {
    const { classes } = useStyles()

    return (
        <InjectedDialog open={open} onClose={onClose} title={<Trans>Claim</Trans>}>
            <DialogContent sx={{ padding: 0 }}>
                <AirDropActivities />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PluginWalletStatusBar
                    requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM}
                    requiredSupportChainIds={[ChainId.Arbitrum]}
                />
            </DialogActions>
        </InjectedDialog>
    )
})

ClaimDialog.displayName = 'ClaimDialog'
