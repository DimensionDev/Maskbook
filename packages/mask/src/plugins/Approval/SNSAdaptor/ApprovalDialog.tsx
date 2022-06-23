import { DialogContent } from '@mui/material'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useState, useMemo } from 'react'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { InjectedDialog } from '@masknet/shared'
import { useStyles } from './useStyles'
import { useTokenApproved } from './hooks/useTokenApproved'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    enum Tabs {
        Tokens = 0,
        Collectibles = 1,
    }
    const [currentTab, setCurrentTab] = useState(Tabs.Tokens)
    const tabs = useMemo(
        () => [
            {
                label: t.tokens(),
                isActive: currentTab === Tabs.Tokens,
                clickHandler: () => setCurrentTab(Tabs.Tokens),
            },
            {
                label: t.collectibles(),
                isActive: currentTab === Tabs.Collectibles,
                clickHandler: () => setCurrentTab(Tabs.Collectibles),
            },
        ],
        [currentTab],
    )
    return (
        <TargetChainIdContext.Provider>
            <InjectedDialog
                open={open}
                title={t.plugin_name()}
                onClose={onClose}
                classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}
                titleTabs={tabs}>
                <DialogContent className={classes.dialogContent}>
                    <ApprovalWrapper />
                </DialogContent>
            </InjectedDialog>
        </TargetChainIdContext.Provider>
    )
}

function ApprovalWrapper() {
    const { targetChainId: chainId, setTargetChainId } = TargetChainIdContext.useContainer()
    const approvalDefinition = useActivatedPlugin(PluginId.Approval, 'any')
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList = approvalDefinition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const { classes } = useStyles()

    return (
        <div className={classes.approvalWrapper}>
            <div className={classes.abstractTabWrapper}>
                <NetworkTab
                    chainId={chainId}
                    setChainId={setTargetChainId}
                    classes={classes}
                    chains={chainIdList.filter(Boolean) as ChainId[]}
                />
            </div>
            <ApprovalTokenContent />
        </div>
    )
}

function ApprovalTokenContent() {
    const { classes } = useStyles()
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { value } = useTokenApproved('0x790116d0685eb197b886dacad9c247f785987a4a', targetChainId)
    console.log({ value })
    return <div className={classes.approvalContentWrapper}>123</div>
}
