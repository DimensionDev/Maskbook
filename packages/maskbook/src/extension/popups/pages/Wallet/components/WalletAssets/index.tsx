import { memo, useState } from 'react'
import { Button, Tab, Tabs, styled, tabClasses, tabsClasses } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletHeader } from '../WalletHeader'
import { WalletInfo } from '../WalletInfo'
import { TabContext, TabPanel } from '@material-ui/lab'
import { EnterDashboard } from '../../../../components/EnterDashboard'
import { AssetsList } from '../AssetsList'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../../index'
import { ActivityList } from '../ActivityList'
import { useI18N } from '../../../../../../utils'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'

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
        overflow: 'auto',
    },
    addToken: {
        padding: 16,
    },
    button: {
        fontWeight: 600,
        backgroundColor: '#ffffff',
        padding: '9px 0',
        borderRadius: 20,
    },
})

const StyledTabs = styled(Tabs)`
    &.${tabsClasses.root} {
        min-height: unset;
        background-color: #f7f9fa;
        padding-top: 6px;
    }
    & .${tabsClasses.indicator} {
        display: none;
    }
    & .${tabsClasses.flexContainer} {
        justify-content: center;
    }
`

const StyledTab = styled(Tab)`
    &.${tabClasses.root} {
        font-size: 12px;
        line-height: 16px;
        min-height: unset;
        min-width: 165px;
        padding: 7px 0;
        background-color: #f7f9fa;
        border-radius: 4px 4px 0px 0px;
        color: #15181b;
    }
    &.${tabClasses.selected} {
        background-color: white;
        font-weight: 500;
    }
`

enum WalletTabs {
    Assets = 'Assets',
    Activity = 'Activity',
}

export const WalletAssets = memo(() => {
    const history = useHistory()
    return <WalletAssetsUI onAddTokenClick={() => history.push(PopupRoutes.AddToken)} />
})

export interface WalletAssetsUIProps {
    onAddTokenClick: () => void
}

export const WalletAssetsUI = memo<WalletAssetsUIProps>(({ onAddTokenClick }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { assetsLoading } = useContainer(WalletContext)
    const [currentTab, setCurrentTab] = useState(WalletTabs.Assets)

    return assetsLoading ? (
        <LoadingPlaceholder />
    ) : (
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
                        style={{ height: currentTab === WalletTabs.Assets ? 362 : 0 }}>
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
                        style={{ height: currentTab === WalletTabs.Activity ? 362 : 0 }}>
                        <ActivityList />
                    </TabPanel>
                </TabContext>
            </div>
            <EnterDashboard />
        </>
    )
})
