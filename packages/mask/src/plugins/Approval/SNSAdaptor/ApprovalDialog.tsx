import { compact } from 'lodash-unified'
import { DialogContent, Button, Tab } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { PluginWalletStatusBar, InjectedDialog } from '@masknet/shared'
import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'
import { NetworkTab } from '../../../components/shared/NetworkTab.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales/index.js'
import { useI18N as useBaseI18n } from '../../../utils/index.js'
import { WalletMessages } from '../../../plugins/Wallet/messages.js'
import { ApprovalEmptyContent } from './ApprovalEmptyContent.js'
import { ApprovalTokenContent } from './ApprovalTokenContent.js'
import { ApprovalNFTContent } from './ApprovalNFTContent.js'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        dialogRoot: {
            width: 600,
            height: 620,
            overflowX: 'hidden',
        },
        dialogContent: {
            width: 600,
            background: theme.palette.maskColor.bottom,
            padding: 0,
            margin: 'auto',
            overflowX: 'hidden',
        },
        contentWrapper: {
            width: 602,
            padding: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 18,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.maskColor.secondaryLine,
                backgroundClip: 'padding-box',
            },
        },
        dialogTitle: {
            '& > p': {
                overflow: 'visible',
            },
        },
        abstractTabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        tab: {
            height: 36,
            minHeight: 36,
        },
        tabPaper: {
            backgroundColor: 'inherit',
        },
        indicator: {
            display: 'none',
        },
        tabPanel: {
            marginTop: 12,
        },
        approvalWrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
        },
        footer: {
            position: 'sticky',
            bottom: 0,
        },
    }),
)

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

    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const approvalDefinition = useActivatedPlugin(PluginID.Approval, 'any')
    const chainIdList = compact<ChainId>(
        approvalDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? [],
    )

    const { classes } = useStyles()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    return (
        <div className={classes.approvalWrapper}>
            {pluginID === NetworkPluginID.PLUGIN_EVM ? (
                <>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab
                            classes={{
                                tab: classes.tab,
                                tabPanel: classes.tabPanel,
                                indicator: classes.indicator,
                                tabPaper: classes.tabPaper,
                            }}
                            chains={chainIdList}
                        />
                    </div>
                    <section className={classes.contentWrapper}>
                        {tab === Tabs.tokens ? (
                            <ApprovalTokenContent chainId={chainId} />
                        ) : (
                            <ApprovalNFTContent chainId={chainId} />
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
                    {pluginID === NetworkPluginID.PLUGIN_EVM
                        ? tr('wallet_status_button_change')
                        : tr('wallet_status_button_change_to_evm')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
