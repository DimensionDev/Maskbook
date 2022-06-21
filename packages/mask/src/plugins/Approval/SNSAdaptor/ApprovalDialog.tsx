import { DialogContent } from '@mui/material'
import { isDashboardPage } from '@masknet/shared-base'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useState, useMemo } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useI18N } from '../locales'
import { InjectedDialog } from '@masknet/shared'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    paper: {
        background: theme.palette.background.paper,
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    tab: {
        height: 36,
        minHeight: 36,
        backgroundColor: isDashboard ? `${MaskColorVar.primaryBackground2}!important` : undefined,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
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
        marginTop: theme.spacing(3),
    },
}))

export function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
    const t = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })
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
            <InjectedDialog open={open} title={t.plugin_name()} onClose={onClose} classes={classes} titleTabs={tabs}>
                <DialogContent className={classes.paper}>
                    <ApprovalWrapper />
                </DialogContent>
            </InjectedDialog>
        </TargetChainIdContext.Provider>
    )
}

function ApprovalWrapper() {
    const { targetChainId: chainId, setTargetChainId } = TargetChainIdContext.useContainer()
    const isDashboard = isDashboardPage()
    const approvalDefinition = useActivatedPlugin(PluginId.Approval, 'any')
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList = approvalDefinition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? []
    const { classes } = useStyles({ isDashboard })

    return (
        <>
            <div className={classes.abstractTabWrapper}>
                <NetworkTab
                    chainId={chainId}
                    setChainId={setTargetChainId}
                    classes={classes}
                    chains={chainIdList.filter(Boolean) as ChainId[]}
                />
            </div>
        </>
    )
}
