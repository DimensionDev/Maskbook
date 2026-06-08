import { compact } from 'lodash-es'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PluginWalletStatusBar, InjectedDialog, NetworkTab } from '@masknet/shared'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useActivatedPluginSiteAdaptorAny } from '@masknet/plugin-infra/content-script'
import { ApprovalTokenContent } from './ApprovalTokenContent.js'
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

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const { classes } = useStyles()

    return (
        <InjectedDialog
            open={open}
            title={<Trans>Approval</Trans>}
            onClose={onClose}
            classes={{ paper: classes.dialogRoot, dialogTitle: classes.dialogTitle }}>
            <DialogContent className={classes.dialogContent}>
                <ApprovalWrapper />
            </DialogContent>
        </InjectedDialog>
    )
}

function ApprovalWrapper() {
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
                <ApprovalTokenContent chainId={chainId} />
            </section>

            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
        </div>
    )
}
