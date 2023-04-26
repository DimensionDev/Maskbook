import { InjectedDialog, PluginWalletStatusBar } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { memo } from 'react'
import { PluginClaimMessage } from '../../../message.js'
import { useI18N } from '../../../locales/i18n_generated.js'
import { DialogActions, DialogContent, Tab } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ITOActivities } from '../ITOActivities/index.js'
import { AirDropActivities } from '../AirDropActivities/index.js'

// const useStyles = makeStyles()((theme) => ({
//     actions: {
//         padding: 0,
//     },
//     content: {
//         padding: 0,
//     },
//     panel: {
//         padding: 0,
//     },
// }))

export const ClaimDialog = memo(() => {
    const t = useI18N()
    // const { classes } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('AirDrop', 'ITO')

    const { open, closeDialog } = useRemoteControlledDialog(PluginClaimMessage.claimDialogEvent)

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={closeDialog}
                title={t.__plugin_name()}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="Claim">
                        <Tab label={t.airdrop()} value={tabs.AirDrop} />
                        <Tab label={t.ito()} value={tabs.ITO} />
                    </MaskTabList>
                }>
                <DialogContent sx={{ padding: 0 }}>
                    <TabPanel value={tabs.AirDrop} sx={{ padding: 0 }}>
                        <AirDropActivities />
                    </TabPanel>
                    <TabPanel value={tabs.ITO} sx={{ padding: 0 }}>
                        <ITOActivities />
                    </TabPanel>
                </DialogContent>
                <DialogActions sx={{ padding: 0 }}>
                    <PluginWalletStatusBar
                        requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM}
                        requiredSupportChainIds={[ChainId.Arbitrum]}
                    />
                </DialogActions>
            </InjectedDialog>
        </TabContext>
    )
})
