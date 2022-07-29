import { DialogContent, Button, Tab } from '@mui/material'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useState } from 'react'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { useI18N as useBaseI18n, PluginWalletStatusBar } from '../../../utils'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { InjectedDialog } from '@masknet/shared'
import { useStyles } from './useStyles'
import { ApprovalEmptyContent } from './ApprovalEmptyContent'
import { ApprovalTokenContent } from './ApprovalTokenContent'
import { ApprovalNFTContent } from './ApprovalNFTContent'
import { TabContext } from '@mui/lab'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

enum Tabs {
    tokens = 'Tokens',
    collectibles = 'Collectibles',
}

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [currentTab, onChange] = useTabs<Tabs>(Tabs.tokens, Tabs.collectibles)

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                title={t.plugin_name()}
                onClose={onClose}
                classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                        <Tab label={t.tokens()} value={t.tokens()} />
                        <Tab label={t.collectibles()} value={t.collectibles()} />
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
    tab: Tabs
}

function ApprovalWrapper(props: ApprovalWrapperProps) {
    const { tab } = props
    const { t: tr } = useBaseI18n()
    const t = useI18N()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const [networkTabChainId, setNetworkTabChainId] = useState<ChainId>(chainId)
    const approvalDefinition = useActivatedPlugin(PluginId.Approval, 'any')
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList =
        approvalDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []

    const { classes } = useStyles()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    return (
        <div className={classes.approvalWrapper}>
            {pluginId === NetworkPluginID.PLUGIN_EVM ? (
                <>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab
                            chainId={networkTabChainId}
                            setChainId={setNetworkTabChainId}
                            classes={classes}
                            chains={chainIdList?.filter(Boolean) as ChainId[]}
                        />
                    </div>
                    <section className={classes.contentWrapper}>
                        {tab === Tabs.tokens ? (
                            <ApprovalTokenContent chainId={networkTabChainId} />
                        ) : (
                            <ApprovalNFTContent chainId={networkTabChainId} />
                        )}
                    </section>
                </>
            ) : (
                <ApprovalEmptyContent />
            )}
            <PluginWalletStatusBar className={classes.footer}>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => {
                        setSelectProviderDialog({
                            open: true,
                            supportedNetworkList: chainIdList
                                ?.map((chainId) => {
                                    const x = chainResolver.chainNetworkType(chainId)
                                    return x
                                })
                                .filter((x) => Boolean(x)) as NetworkType[],
                        })
                    }}
                    fullWidth>
                    {pluginId === NetworkPluginID.PLUGIN_EVM
                        ? tr('wallet_status_button_change')
                        : tr('wallet_status_button_change_to_evm')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
