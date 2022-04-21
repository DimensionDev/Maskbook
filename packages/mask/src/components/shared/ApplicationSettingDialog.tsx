import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from '../../components/shared/AbstractTab'
import { useI18N } from '../../utils'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList'

interface Props {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    wrapper: {
        padding: 0,
    },
    content: {
        position: 'relative',
        paddingTop: 50,
    },
    tabs: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dialogContent: {
        padding: 0,
    },
    tabPaper: {
        position: 'sticky',
        top: 0,
        zIndex: 5000,
    },
    indicator: {
        display: 'none',
    },
    tab: {
        maxWidth: 160,
    },
    focusTab: {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
    flexContainer: {
        justifyContent: 'space-around',
    },
    dialogTitle: {
        border: 'none',
    },
    tabContent: {
        padding: 16,
    },
}))

export enum DialogTabs {
    appList = 0,
    pluginSwitch = 1,
}

export function ApplicationSettingDialog(props: Props) {
    const { open, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const tabState = useState(DialogTabs.appList)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('application_settings_tab_app_list'),
                children: (
                    <div className={classes.tabContent}>
                        <ApplicationSettingPluginList />
                    </div>
                ),
                sx: { p: 0 },
            },
            {
                label: t('application_settings_tab_plug_in_switch'),
                children: (
                    <div className={classes.tabContent}>
                        <ApplicationSettingPluginSwitch />
                    </div>
                ),
                sx: { p: 0 },
            },
        ],
        state: tabState,
        classes: {
            focusTab: classes.focusTab,
            tabPaper: classes.tabPaper,
            tab: classes.tab,
            flexContainer: classes.flexContainer,
            indicator: classes.indicator,
            tabs: classes.tabs,
        },
    }

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('application_settings')} disableTitleBorder>
            <DialogContent className={classes.wrapper}>
                <AbstractTab height={600} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
