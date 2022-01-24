import { Box, DialogContent } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { makeStyles, useStylesExtends, useTabs } from '@masknet/theme'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import AssetsPanel from './AssetsPanel'
import ParticipatePanel from './ParticipatePanel'
import { useContext } from 'react'
import type { FindTrumanI18nFunction } from '../types'
import { FindTrumanContext } from '../context'
import { useAccount } from '@masknet/plugin-infra'
import { useConst } from './hooks/useConst'

const useStyles = makeStyles()((theme, props) => ({
    wrapper: {
        paddingBottom: '0px !important',
        paddingTop: '0px !important',
    },
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    tabPaneWrapper: {
        width: '100%',
        marginBottom: '24px',
    },
    tabPane: {
        width: 535,
        margin: '0 auto',
        padding: 0,
    },
}))

interface FindTrumanDialogProps {
    onClose(): void
    open: boolean
}

export function FindTrumanDialog(props: FindTrumanDialogProps) {
    const { open, onClose } = props
    const { classes } = useStyles()
    const account = useAccount()
    const { consts, t } = useConst()

    const [currentTab, onChange, tabs] = useTabs(FindTrumanDialogTab.Assets, FindTrumanDialogTab.Participate)

    return (
        <FindTrumanContext.Provider
            value={{
                address: account,
                const: consts,
                t,
            }}>
            <InjectedDialog open={open} onClose={onClose} title="FindTruman">
                <DialogContent className={classes.wrapper}>
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                    {consts && (
                        <TabContext value={currentTab}>
                            <div className={classes.abstractTabWrapper}>
                                <FindTrumanDialogTabs currentTab={currentTab} setTab={(tab) => onChange(null, tab)} />
                            </div>
                            <Box className={classes.tabPaneWrapper}>
                                <TabPanel className={classes.tabPane} value={FindTrumanDialogTab.Assets}>
                                    <AssetsPanel />
                                </TabPanel>
                                <TabPanel className={classes.tabPane} value={FindTrumanDialogTab.Participate}>
                                    <ParticipatePanel storyId={consts.storyId} />
                                </TabPanel>
                            </Box>
                        </TabContext>
                    )}
                </DialogContent>
            </InjectedDialog>
        </FindTrumanContext.Provider>
    )
}

export const useTabsStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
        backgroundColor: `${theme.palette.background.default}!important`,
        marginRight: 1,
        '&:last-child': {
            marginRight: 0,
        },
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
        '& .MuiTabs-flexContainer': {
            display: 'grid',
            gridTemplateColumns: '50% 50%',
            backgroundColor: theme.palette.background.paper,
        },
    },
    indicator: {
        display: 'none',
    },
}))

enum FindTrumanDialogTab {
    Assets = 'assets',
    Participate = 'participate',
}
const FindTrumanDialogTabValues = [FindTrumanDialogTab.Assets, FindTrumanDialogTab.Participate]

interface FindTrumanDialogTabsProps
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    currentTab: FindTrumanDialogTab
    setTab(tab: FindTrumanDialogTab): void
}

function getFindTrumanDialogTabName(t: FindTrumanI18nFunction, type: FindTrumanDialogTab) {
    switch (type) {
        case FindTrumanDialogTab.Assets:
            return t('plugin_find_truman_dialog_tab_assets')
        case FindTrumanDialogTab.Participate:
            return t('plugin_find_truman_dialog_tab_participate')
    }
}

function FindTrumanDialogTabs(props: FindTrumanDialogTabsProps) {
    const classes = useStylesExtends(useTabsStyles(), props)
    const { t } = useContext(FindTrumanContext)
    const { currentTab, setTab } = props
    const createTabItem = (type: FindTrumanDialogTab) => ({
        label: <span>{getFindTrumanDialogTabName(t, type)}</span>,
        sx: { p: 0 },
        cb: () => setTab(type),
    })

    const tabProps: AbstractTabProps = {
        tabs: [createTabItem(FindTrumanDialogTab.Assets), createTabItem(FindTrumanDialogTab.Participate)],
        index: FindTrumanDialogTabValues.indexOf(currentTab),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}
