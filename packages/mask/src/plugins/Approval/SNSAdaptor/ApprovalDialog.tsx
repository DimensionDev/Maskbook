import { DialogContent } from '@mui/material'
import { useState, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales'
import { InjectedDialog } from '@masknet/shared'

export interface ApprovalDialogProps {
    open: boolean
    onClose?: () => void
}

const useStyles = makeStyles()((theme) => ({
    dialogTitle: {},
    paper: {
        background: theme.palette.background.paper,
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
        <InjectedDialog open={open} title={t.plugin_name()} onClose={onClose} classes={classes} titleTabs={tabs}>
            <DialogContent className={classes.paper}>123</DialogContent>
        </InjectedDialog>
    )
}
