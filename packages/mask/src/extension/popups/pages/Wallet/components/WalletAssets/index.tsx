import { Icons } from '@masknet/icons'
import { RestorableScroll } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useTabs } from '@masknet/theme'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab, styled, tabClasses, tabsClasses } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMount } from 'react-use'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../../utils/index.js'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { ActivityList } from '../ActivityList/index.js'
import { AssetsList } from '../AssetsList/index.js'
import { WalletAssetTabs } from '../../type.js'
import { Collectibles } from '../Collectibles/index.js'

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
            color: theme.palette.maskColor.second,
            minHeight: 'unset',
            backgroundColor: 'transparent',
            borderRadius: '12px 12px 0 0',
            boxShadow: 'none',
            [`&.${tabClasses.selected}`]: {
                backgroundColor: theme.palette.maskColor.bottom,
                fontWeight: 700,
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

export const WalletAssets = memo(function WalletAssets() {
    const navigate = useNavigate()
    const { chainId } = useChainContext()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { refreshAssets } = useContainer(WalletContext)

    useMount(() => {
        refreshAssets()
    })

    const handleAdd = useCallback(() => navigate(`${PopupRoutes.AddToken}/${chainId}`), [chainId, navigate])

    return wallet ? <WalletAssetsUI onAddToken={handleAdd} /> : null
})

export interface WalletAssetsUIProps {
    onAddToken: () => void
}

export const WalletAssetsUI = memo<WalletAssetsUIProps>(function WalletAssetsUI({ onAddToken }) {
    const { t } = useI18N()
    const [params, setParams] = useSearchParams()
    const paramTab = params.get('tab') as WalletAssetTabs

    const { classes } = useStyles()
    const [currentTab, onChange] = useTabs(
        paramTab || WalletAssetTabs.Tokens,
        WalletAssetTabs.Tokens,
        WalletAssetTabs.Collectibles,
        WalletAssetTabs.Activity,
    )

    return (
        <div className={classes.content}>
            <TabContext value={currentTab}>
                <Box className={classes.header}>
                    <StyledTabList
                        value={currentTab}
                        onChange={(_, tab) => {
                            setParams(
                                (params) => {
                                    params.set('tab', tab)
                                    return params.toString()
                                },
                                { replace: true },
                            )
                            onChange(_, tab)
                        }}>
                        <Tab
                            className={classes.tab}
                            label={t('popups_wallet_tab_assets')}
                            value={WalletAssetTabs.Tokens}
                        />
                        <Tab
                            className={classes.tab}
                            label={t('popups_wallet_tab_collectibles')}
                            value={WalletAssetTabs.Collectibles}
                        />
                        <Tab
                            className={classes.tab}
                            label={t('popups_wallet_tab_activity')}
                            value={WalletAssetTabs.Activity}
                        />
                    </StyledTabList>
                    <Button variant="text" className={classes.addButton} onClick={onAddToken}>
                        <Icons.AddNoBorder size={16} />
                    </Button>
                </Box>
                <Box className={classes.panels}>
                    <RestorableScroll scrollKey="assets" enabled={currentTab === WalletAssetTabs.Tokens}>
                        <TabPanel value={WalletAssetTabs.Tokens} className={classes.tabPanel}>
                            <AssetsList />
                        </TabPanel>
                    </RestorableScroll>
                    <RestorableScroll scrollKey="collectibles" enabled={currentTab === WalletAssetTabs.Collectibles}>
                        <TabPanel value={WalletAssetTabs.Collectibles} className={classes.tabPanel}>
                            <Collectibles />
                        </TabPanel>
                    </RestorableScroll>
                    <RestorableScroll scrollKey="activities" enabled={currentTab === WalletAssetTabs.Activity}>
                        <TabPanel value={WalletAssetTabs.Activity} className={classes.tabPanel}>
                            <ActivityList />
                        </TabPanel>
                    </RestorableScroll>
                </Box>
            </TabContext>
        </div>
    )
})
