import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, useTabs } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab, styled, tabClasses, tabsClasses } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMount } from 'react-use'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../../utils/index.js'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { ActivityList } from '../ActivityList/index.js'
import { AssetsList } from '../AssetsList/index.js'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        content: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            marginTop: -34,
        },
        header: {
            display: 'flex',
        },
        tab: {
            height: 34,
            padding: '8px 12px',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Helvetica',
            color: theme.palette.maskColor.second,
            minHeight: 'unset',
            backgroundColor: 'transparent',
            borderRadius: '12px 12px 0 0',
            boxShadow: 'none',
            [`&.${tabClasses.selected}`]: {
                backgroundColor: theme.palette.maskColor.bottom,
                fontWeight: 700,
                fontFamily: 'Helvetica',
                color: theme.palette.maskColor.main,
                boxShadow: `0px 4px 6px 0px ${isDark ? 'rgba(0, 0, 0, 0.10)' : 'rgba(102, 108, 135, 0.10)'}`,
                backdropFilter: 'blur(5px)',
            },
        },
        panels: {
            overflow: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
        },
        tabPanel: {
            '&:not([hidden])': {
                padding: 0,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
            },
        },
        addButton: {
            minWidth: 'auto',
            height: 24,
            width: 24,
            marginRight: theme.spacing(2),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: theme.spacing(0.5),
            backgroundColor: theme.palette.maskColor.bottom,
            boxShadow: `0px 4px 6px 0px ${isDark ? 'rgba(0, 0, 0, 0.10)' : 'rgba(102, 108, 135, 0.10)'}`,
            marginLeft: 'auto',
        },
    }
})

const StyledTabList = styled(TabList)`
    &.${tabsClasses.root} {
        min-height: unset;
        background-color: transparent;
        padding: 0 16px;
        flex-shrink: 0;
    }
    & .${tabsClasses.indicator} {
        display: none;
    }
`

enum WalletTabs {
    Tokens = 'Tokens',
    Collectibles = 'Collectibles',
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

enum AssetTabs {
    Tokens = 'Tokens',
    Collectibles = 'Collectibles',
    Activity = 'Activity',
}

export const WalletAssetsUI = memo<WalletAssetsUIProps>(function WalletAssetsUI({ onAddTokenClick }) {
    const { t } = useI18N()

    const { classes } = useStyles()
    const { assetsLoading } = useContainer(WalletContext)
    const [currentTab, onChange, tabs] = useTabs(AssetTabs.Tokens, AssetTabs.Collectibles, AssetTabs.Activity)

    return assetsLoading ? (
        <LoadingStatus height="100%" />
    ) : (
        <div className={classes.content}>
            <TabContext value={currentTab}>
                <Box className={classes.header}>
                    <StyledTabList value={currentTab} onChange={onChange}>
                        <Tab className={classes.tab} label={t('popups_wallet_tab_assets')} value={tabs.Tokens} />
                        <Tab className={classes.tab} label="Collectives" value={tabs.Collectibles} />
                        <Tab className={classes.tab} label={t('popups_wallet_tab_activity')} value={tabs.Activity} />
                    </StyledTabList>
                    <Button variant="text" className={classes.addButton}>
                        <Icons.AddNoBorder size={16} />
                    </Button>
                </Box>
                <Box className={classes.panels}>
                    <TabPanel value={tabs.Tokens} className={classes.tabPanel}>
                        <AssetsList />
                        <div style={{ padding: 16 }}>
                            <ActionButton variant="roundedOutlined" fullWidth onClick={onAddTokenClick}>
                                {t('add_token')}
                            </ActionButton>
                        </div>
                    </TabPanel>
                    <TabPanel value={tabs.Collectibles} className={classes.tabPanel}>
                        <EmptyStatus height="100%">{t('empty')}</EmptyStatus>
                    </TabPanel>
                    <TabPanel value={tabs.Activity} className={classes.tabPanel}>
                        <ActivityList />
                    </TabPanel>
                </Box>
            </TabContext>
        </div>
    )
})
