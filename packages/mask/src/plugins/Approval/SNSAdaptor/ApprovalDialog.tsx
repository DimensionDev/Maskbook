import { DialogContent, Button, Tab, Typography } from '@mui/material'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useState } from 'react'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginWalletStatusBar } from '../../../utils/components/PluginWalletStatusBar'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { useI18N as useBaseI18n } from '../../../utils'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { InjectedDialog } from '@masknet/shared'
import { useStyles } from './useStyles'
import { ApprovalTokenContent } from './ApprovalTokenContent'
import { ApprovalNFTContent } from './ApprovalNFTContent'
import { TabContext } from '@mui/lab'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

enum Tabs {
    Tokens = 0,
    Collectibles = 1,
}

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [currentTab, onChange] = useTabs(t.tokens(), t.collectibles())

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                title={t.plugin_name()}
                onClose={onClose}
                classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                        <Tab label={<Typography>{t.tokens()}</Typography>} value={t.tokens()} />
                        <Tab label={<Typography>{t.collectibles()}</Typography>} value={t.collectibles()} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.dialogContent}>
                    <ApprovalWrapper tab={currentTab} />
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}

interface ApprovalWrapperProps {
    tab: string
}

function ApprovalWrapper(props: ApprovalWrapperProps) {
    const { tab } = props
    const { t: tr } = useBaseI18n()
    const t = useI18N()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const [networkTabChainId, setNetworkTabChainId] = useState<ChainId>(chainId)
    const approvalDefinition = useActivatedPlugin(PluginId.Approval, 'any')
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList = approvalDefinition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const { classes } = useStyles()
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    return (
        <div className={classes.approvalWrapper}>
            <div className={classes.abstractTabWrapper}>
                <NetworkTab
                    chainId={networkTabChainId}
                    setChainId={setNetworkTabChainId}
                    classes={classes}
                    chains={chainIdList.filter(Boolean) as ChainId[]}
                />
            </div>
            {tab === t.tokens() ? (
                <ApprovalTokenContent chainId={networkTabChainId} />
            ) : (
                <ApprovalNFTContent chainId={networkTabChainId} />
            )}
            <PluginWalletStatusBar className={classes.footer}>
                <Button variant="contained" size="medium" onClick={openSelectProviderDialog} fullWidth>
                    {tr('wallet_status_button_change')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
