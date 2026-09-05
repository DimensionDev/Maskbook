import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { RestorableScroll, useParamTab } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { Boundary, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab, styled, tabClasses, tabsClasses } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletAssetTabs } from '../../type.js'
import { ActivityList } from '../ActivityList/index.js'
import { AssetsList } from '../AssetsList/index.js'

const useStyles = makeStyles()((theme) => {
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
            alignItems: 'center',
        },
        tab: {
            height: 34,
            padding: '8px 12px',
            fontSize: 14,
            fontWeight: 700,
            color: theme.vars.palette.maskColor.second,
            minHeight: 'unset',
            backgroundColor: 'transparent',
            borderRadius: '12px 12px 0 0',
            boxShadow: 'none',
            [`&.${tabClasses.selected}`]: {
                backgroundColor: theme.vars.palette.maskColor.bottom,
                fontWeight: 700,
                color: theme.vars.palette.maskColor.main,
                boxShadow: '0px 4px 6px 0px rgba(102, 108, 135, 0.10)',
                ...theme.applyStyles('dark', { boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)' }),
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
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
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
            backgroundColor: theme.vars.palette.maskColor.bottom,
            boxShadow: '0px 4px 6px 0px rgba(102, 108, 135, 0.10)',
            ...theme.applyStyles('dark', { boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)' }),
            marginLeft: 'auto',
        },
    }
})

const StyledTabList = styled(TabList)({
    [`&.${tabsClasses.root}`]: {
        minHeight: 'unset',
        backgroundColor: 'transparent',
        padding: '0 16px',
        flexShrink: 0,
    },
    [`& .${tabsClasses.indicator}`]: {
        display: 'none',
    },
})

export const Component = memo(function WalletAssets() {
    const navigate = useNavigate()
    const { chainId } = useChainContext()

    const handleAdd = useCallback(
        (assetTab: WalletAssetTabs) => navigate(`${PopupRoutes.AddToken}/${chainId}/${assetTab}`),
        [chainId, navigate],
    )

    return <WalletAssetsUI onAddToken={handleAdd} />
})

interface WalletAssetsUIProps {
    onAddToken: (assetTab: WalletAssetTabs) => void
}

const WalletAssetsUI = memo<WalletAssetsUIProps>(function WalletAssetsUI({ onAddToken }) {
    const { classes } = useStyles()
    const [currentTab, handleTabChange] = useParamTab<WalletAssetTabs>(WalletAssetTabs.Tokens)

    return (
        <div className={classes.content}>
            <TabContext value={currentTab}>
                <Box className={classes.header}>
                    <StyledTabList onChange={handleTabChange}>
                        <Tab className={classes.tab} label={<Trans>Tokens</Trans>} value={WalletAssetTabs.Tokens} />
                        <Tab
                            className={classes.tab}
                            label={<Trans>Activities</Trans>}
                            value={WalletAssetTabs.Activity}
                        />
                    </StyledTabList>
                    <Button variant="text" className={classes.addButton} onClick={() => onAddToken(currentTab)}>
                        <Icons.Plus size={16} />
                    </Button>
                </Box>

                <Boundary>
                    <Box className={classes.panels}>
                        <RestorableScroll scrollKey="assets">
                            <TabPanel value={WalletAssetTabs.Tokens} className={classes.tabPanel}>
                                <AssetsList />
                            </TabPanel>
                        </RestorableScroll>

                        <RestorableScroll scrollKey="activities">
                            <TabPanel value={WalletAssetTabs.Activity} className={classes.tabPanel}>
                                <ActivityList />
                            </TabPanel>
                        </RestorableScroll>
                    </Box>
                </Boundary>
            </TabContext>
        </div>
    )
})
