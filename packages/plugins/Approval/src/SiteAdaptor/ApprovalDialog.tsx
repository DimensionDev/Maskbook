import { compact } from 'lodash-es'
import { DialogContent, Tab } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { PluginWalletStatusBar, InjectedDialog, NetworkTab } from '@masknet/shared'
import { useChainContext } from '@masknet/web3-hooks-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useActivatedPluginSiteAdaptorAny } from '@masknet/plugin-infra/content-script'
import { ApprovalTokenContent } from './ApprovalTokenContent.js'
import { ApprovalNFTContent } from './ApprovalNFTContent.js'
import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme, props) => ({
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
        scrollbarWidth: 'none',
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
}))

interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

enum Tabs {
    tokens = 'Tokens',
    collectibles = 'Collectibles',
}

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const { classes } = useStyles()

    const [currentTab, onChange] = useTabs<Tabs>(Tabs.tokens, Tabs.collectibles)

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                title={<Trans>Approval</Trans>}
                onClose={onClose}
                classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange}>
                        <Tab label={<Trans>Tokens</Trans>} value={Tabs.tokens} />
                        <Tab label={<Trans>Collectibles</Trans>} value={Tabs.collectibles} />
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

function ApprovalWrapper({ tab }: ApprovalWrapperProps) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const approvalDefinition = useActivatedPluginSiteAdaptorAny(PluginID.Approval)
    const chainIdList = useMemo(() => {
        return compact<ChainId>(
            approvalDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? EMPTY_LIST,
        )
    }, [approvalDefinition])
    const { classes } = useStyles()

    return (
        <div className={classes.approvalWrapper}>
            <div className={classes.abstractTabWrapper}>
                <NetworkTab chains={chainIdList} pluginID={NetworkPluginID.PLUGIN_EVM} />
            </div>
            <section className={classes.contentWrapper}>
                {tab === Tabs.tokens ?
                    <ApprovalTokenContent chainId={chainId} />
                :   <ApprovalNFTContent chainId={chainId} />}
            </section>

            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
        </div>
    )
}
