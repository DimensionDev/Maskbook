import { Box, DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles, MaskTabList, useStylesExtends, useTabs } from '@masknet/theme'
import AssetsPanel from './AssetsPanel'
import ParticipatePanel from './ParticipatePanel'
import { useContext } from 'react'
import type { FindTrumanI18nFunction } from '../types'
import { FindTrumanContext } from '../context'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { useConst } from './hooks/useConst'
import IntroductionPanel from './IntroductionPanel'
import { PluginWalletStatusBar, useI18N } from '../../../utils'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme, props) => ({
    wrapper: {
        paddingBottom: '0 !important',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
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
    power: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        width: 22,
        height: 22,
        paddingLeft: 12,
    },
    actions: {
        padding: 0,
        display: 'block',
    },
    statusBar: {
        margin: 0,
    },
}))

interface FindTrumanDialogProps {
    onClose(): void
    open: boolean
}

export function FindTrumanDialog(props: FindTrumanDialogProps) {
    const { t: i18N } = useI18N()
    const { open, onClose } = props
    const { classes } = useStyles()
    const account = useAccount()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { consts, t } = useConst()

    const [currentTab, onChange, tabs] = useTabs(
        FindTrumanDialogTab.Introduction,
        FindTrumanDialogTab.Assets,
        FindTrumanDialogTab.Participate,
    )

    return (
        <FindTrumanContext.Provider
            value={{
                address: account,
                const: consts,
                t,
            }}>
            <TabContext value={currentTab}>
                <InjectedDialog
                    open={open}
                    onClose={onClose}
                    title="FindTruman"
                    titleTabs={<FindTrumanDialogTabs tabs={tabs} onChange={onChange} />}>
                    <DialogContent className={classes.wrapper}>
                        {consts && (
                            <Box className={classes.tabPaneWrapper}>
                                <TabPanel className={classes.tabPane} value={FindTrumanDialogTab.Introduction}>
                                    <IntroductionPanel />
                                </TabPanel>
                                <TabPanel className={classes.tabPane} value={FindTrumanDialogTab.Assets}>
                                    <AssetsPanel />
                                </TabPanel>
                                <TabPanel className={classes.tabPane} value={FindTrumanDialogTab.Participate}>
                                    <ParticipatePanel storyId={consts.storyId} />
                                </TabPanel>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Box className={classes.power}>
                            <Typography
                                sx={{ marginRight: 1 }}
                                variant="body1"
                                color="textSecondary"
                                fontSize={14}
                                fontWeight={700}>
                                {i18N('plugin_findtruman_powered_by')}
                            </Typography>
                            <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                                {i18N('plugin_findtruman_find_truman')}
                            </Typography>
                            <img
                                className={classes.icon}
                                src={new URL('../assets/findtruman.png', import.meta.url).toString()}
                            />
                        </Box>
                        <PluginWalletStatusBar className={classes.statusBar}>
                            <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId} />
                        </PluginWalletStatusBar>
                    </DialogActions>
                </InjectedDialog>
            </TabContext>
        </FindTrumanContext.Provider>
    )
}

interface TabProps {
    columns: string
}

export const useTabsStyles = makeStyles<TabProps>()((theme, props) => ({
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
            gridTemplateColumns: props.columns,
            backgroundColor: theme.palette.background.paper,
        },
    },
    indicator: {
        display: 'none',
    },
}))

enum FindTrumanDialogTab {
    Introduction = 'introduction',
    Assets = 'assets',
    Participate = 'participate',
}
const FindTrumanDialogTabValues = [
    FindTrumanDialogTab.Introduction,
    FindTrumanDialogTab.Assets,
    FindTrumanDialogTab.Participate,
]

interface FindTrumanDialogTabsProps
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    tabs: Record<FindTrumanDialogTab, FindTrumanDialogTab>
    onChange: (event: unknown, value: string) => void
}

function getFindTrumanDialogTabName(t: FindTrumanI18nFunction, type: FindTrumanDialogTab) {
    switch (type) {
        case FindTrumanDialogTab.Introduction:
            return t('plugin_find_truman_dialog_tab_introduction')
        case FindTrumanDialogTab.Assets:
            return t('plugin_find_truman_dialog_tab_assets')
        case FindTrumanDialogTab.Participate:
            return t('plugin_find_truman_dialog_tab_participate')
    }
}

function FindTrumanDialogTabs(props: FindTrumanDialogTabsProps) {
    const classes = useStylesExtends(useTabsStyles({ columns: 'repeat(3, 33.33%)' }), props)
    const { t } = useContext(FindTrumanContext)
    const { onChange, tabs } = props

    return (
        <MaskTabList variant="base" onChange={onChange} aria-label="FindTrumanTabs">
            <Tab
                label={<span>{getFindTrumanDialogTabName(t, FindTrumanDialogTab.Introduction)}</span>}
                value={tabs.introduction}
            />
            <Tab label={<span>{getFindTrumanDialogTabName(t, FindTrumanDialogTab.Assets)}</span>} value={tabs.assets} />
            <Tab
                label={<span>{getFindTrumanDialogTabName(t, FindTrumanDialogTab.Participate)}</span>}
                value={tabs.participate}
            />
        </MaskTabList>
    )
}
