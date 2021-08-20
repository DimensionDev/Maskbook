import { memo, useState } from 'react'
import { Button, Tab, Tabs } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletHeader } from '../WalletHeader'
import { WalletInfo } from '../WalletInfo'
import { TabContext, TabPanel } from '@material-ui/lab'
import { withStyles } from '@material-ui/styles'
import { EnterDashboard } from '../../../../components/EnterDashboard'
import { AssetsList } from '../AssetsList'
import { useHistory } from 'react-router-dom'
import { DialogRoutes } from '../../../../index'
import { ActivityList } from '../ActivityList'
import { useI18N } from '../../../../../../utils'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    tabPanel: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    addToken: {
        padding: 16,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: '9px 0',
        borderRadius: 20,
    },
})

const StyledTabs = withStyles({
    root: {
        minHeight: 'unset',
        backgroundColor: '#F7F9FA',
        paddingTop: 6,
    },
    indicator: {
        display: 'none',
    },
    flexContainer: {
        justifyContent: 'center',
    },
})(Tabs)

const StyledTab = withStyles({
    root: {
        fontSize: 12,
        lineHeight: '16px',
        minHeight: 'unset',
        minWidth: 145,
        padding: '7px 0',
        backgroundColor: '#F7F9FA',
        borderRadius: '4px 4px 0px 0px',
        color: '#15181B',
    },
    selected: {
        backgroundColor: '#ffffff',
        fontWeight: 500,
    },
})(Tab)

enum WalletTabs {
    Assets = 'Assets',
    Activity = 'Activity',
}

export const WalletAssets = memo(() => {
    const history = useHistory()
    return <WalletAssetsUI onAddTokenClick={() => history.push(DialogRoutes.AddToken)} />
})

export interface WalletAssetsUIProps {
    onAddTokenClick: () => void
}

export const WalletAssetsUI = memo<WalletAssetsUIProps>(({ onAddTokenClick }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [currentTab, setCurrentTab] = useState(WalletTabs.Assets)

    return (
        <>
            <WalletHeader />
            <WalletInfo />
            <div className={classes.content}>
                <TabContext value={currentTab}>
                    <StyledTabs value={currentTab} onChange={(event, tab) => setCurrentTab(tab)}>
                        <StyledTab label={t('popups_wallet_tab_assets')} value={WalletTabs.Assets} />
                        <StyledTab label={t('popups_wallet_tab_activity')} value={WalletTabs.Activity} />
                    </StyledTabs>
                    <TabPanel
                        value={WalletTabs.Assets}
                        className={classes.tabPanel}
                        style={{ flex: currentTab === WalletTabs.Assets ? '1' : '0' }}>
                        <AssetsList />
                        <div style={{ padding: 16 }}>
                            <Button className={classes.button} fullWidth onClick={onAddTokenClick}>
                                {t('add_token')}
                            </Button>
                        </div>
                    </TabPanel>
                    <TabPanel
                        value={WalletTabs.Activity}
                        className={classes.tabPanel}
                        style={{ flex: currentTab === WalletTabs.Activity ? '1' : '0' }}>
                        <ActivityList />
                    </TabPanel>
                </TabContext>
            </div>
            <EnterDashboard />
        </>
    )
})
