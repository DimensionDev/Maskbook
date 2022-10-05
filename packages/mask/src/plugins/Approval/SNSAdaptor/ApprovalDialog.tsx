import { useState } from 'react'
import { DialogContent, Button, Tab } from '@mui/material'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'
import { TargetChainIdContext } from '@masknet/web3-hooks-evm'
import { InjectedDialog } from '@masknet/shared'
import { NetworkTab } from '../../../components/shared/NetworkTab.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginID } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales/index.js'
import { useI18N as useBaseI18n, PluginWalletStatusBar } from '../../../utils/index.js'
import { WalletMessages } from '../../../plugins/Wallet/messages.js'
import { useStyles } from './useStyles.js'
import { ApprovalEmptyContent } from './ApprovalEmptyContent.js'
import { ApprovalTokenContent } from './ApprovalTokenContent.js'
import { ApprovalNFTContent } from './ApprovalNFTContent.js'

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
    const approvalDefinition = useActivatedPlugin(PluginID.Approval, 'any')
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
                                    const x = chainResolver.networkType(chainId)
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
