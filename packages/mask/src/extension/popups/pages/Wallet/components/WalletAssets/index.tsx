import { LoadingStatus } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Tabs, styled, tabClasses, tabsClasses } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMount } from 'react-use'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../../utils/index.js'
import { Navigator } from '../../../../components/Navigator/index.js'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { ActivityList } from '../ActivityList/index.js'
import { AssetsList } from '../AssetsList/index.js'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    tabPanel: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
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
        border-radius: 4px 4px 0 0;
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

export const WalletAssets = memo(function WalletAssets() {
    const navigate = useNavigate()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { refreshAssets } = useContainer(WalletContext)

    useMount(() => {
        refreshAssets()
    })
    const handleAdd = useCallback(() => navigate(PopupRoutes.AddToken), [navigate])

    return wallet ? <WalletAssetsUI onAddTokenClick={handleAdd} /> : null
})

export interface WalletAssetsUIProps {
    onAddTokenClick: () => void
}

export const WalletAssetsUI = memo<WalletAssetsUIProps>(function WalletAssetsUI({ onAddTokenClick }) {
    const { t } = useI18N()

    const { classes } = useStyles()
    const { assetsLoading } = useContainer(WalletContext)
    const [currentTab, setCurrentTab] = useState(WalletTabs.Assets)

    return assetsLoading ? (
        <LoadingStatus height="100%" />
    ) : (
        <>
            <div className={classes.content}>
                <TabContext value={currentTab}>
                    <StyledTabs value={currentTab} onChange={(_, tab) => setCurrentTab(tab)}>
                        <StyledTab label={t('popups_wallet_tab_assets')} value={WalletTabs.Assets} />
                        <StyledTab label={t('popups_wallet_tab_activity')} value={WalletTabs.Activity} />
                    </StyledTabs>
                    <TabPanel
                        value={WalletTabs.Assets}
                        className={classes.tabPanel}
                        style={{ height: currentTab === WalletTabs.Assets ? 396 : 0 }}>
                        <AssetsList />
                        <div style={{ padding: 16 }}>
                            <ActionButton variant="roundedOutlined" fullWidth onClick={onAddTokenClick}>
                                {t('add_token')}
                            </ActionButton>
                        </div>
                    </TabPanel>
                    <TabPanel
                        value={WalletTabs.Activity}
                        className={classes.tabPanel}
                        style={{ height: currentTab === WalletTabs.Activity ? 396 : 0 }}>
                        <ActivityList />
                    </TabPanel>
                </TabContext>
            </div>
            <Navigator />
        </>
    )
})
