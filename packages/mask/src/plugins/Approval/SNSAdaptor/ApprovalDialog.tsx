import { DialogContent, Typography } from '@mui/material'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useState, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { InjectedDialog } from '@masknet/shared'
import { EmptySimpleIcon, CircleLoadingIcon } from '@masknet/icons'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

const useStyles = makeStyles()((theme) => ({
    dialogRoot: {
        background: theme.palette.background.paper,
        width: 600,
        height: 620,
        overflowX: 'hidden',
    },
    dialogContent: {
        width: 568,
        padding: '12px 16px',
        margin: 'auto',
    },
    dialogTitle: {
        '& > p': {
            overflow: 'visible',
        },
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
        padding: 0,
        maxWidth: '100%',
        margin: '0 auto',
        borderRadius: 4,
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
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
    approvalEmptyOrLoadingWrapper: {
        flexGrow: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approvalEmptyOrLoadingContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
    },
    emptyText: {
        color: theme.palette.text.secondary,
    },
    emptyIcon: {
        width: 36,
        height: 36,
        marginBottom: 13,
    },
    loadingIcon: {
        width: 36,
        height: 36,
        marginBottom: 13,
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
        animation: 'loadingAnimation 1s linear infinite',
    },
    loadingText: {
        color: theme.palette.text.primary,
    },
}))

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
            <ApprovalLoadingContent />
        </div>
    )
}

function ApprovalEmptyContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.emptyText)}>
                <EmptySimpleIcon className={classes.emptyIcon} />
                <Typography>{t.no_approved_contract_records()}</Typography>
            </div>
        </div>
    )
}

function ApprovalLoadingContent() {
    const { classes, cx } = useStyles()

    const t = useI18N()
    return (
        <div className={classes.approvalEmptyOrLoadingWrapper}>
            <div className={cx(classes.approvalEmptyOrLoadingContent, classes.loadingText)}>
                <CircleLoadingIcon className={classes.loadingIcon} />
                <Typography>{t.loading()}</Typography>
            </div>
        </div>
    )
}
