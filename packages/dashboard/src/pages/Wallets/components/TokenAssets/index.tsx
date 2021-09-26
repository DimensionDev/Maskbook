import { memo, useState } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { TabContext, TabPanel } from '@material-ui/lab'
import { Tab, Tabs, Box, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { TokenTable } from '../TokenTable'
import { useDashboardI18N } from '../../../../locales'
import { CollectibleList } from '../CollectibleList'
import { AddCollectibleDialog } from '../AddCollectibleDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../../../API'

const useStyles = makeStyles()((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${MaskColorVar.lineLighter}`,
    },
    addCustomTokenButton: {
        borderRadius: Number(theme.shape.borderRadius) * 3.5,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.pxToRem(16),
    },
    tab: {
        flex: 1,
        padding: '0px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
}))

export enum AssetTab {
    Token = 'Token',
    Investment = 'Investment',
    Collectibles = 'Collectibles',
}

const assetTabs = [AssetTab.Token, AssetTab.Collectibles] as const

export const TokenAssets = memo(() => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const assetTabsLabel: Record<AssetTab, string> = {
        [AssetTab.Token]: t.wallets_assets_token(),
        [AssetTab.Investment]: t.wallets_assets_investment(),
        [AssetTab.Collectibles]: t.wallets_assets_collectibles(),
    }

    const [activeTab, setActiveTab] = useState<AssetTab>(assetTabs[0])

    const [addCollectibleOpen, setAddCollectibleOpen] = useState(false)
    const { setDialog: setSelectToken } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectERC20TokenDialogUpdated,
    )

    return (
        <>
            <ContentContainer
                sx={{ marginTop: 3, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100% - 114px)' }}>
                <TabContext value={activeTab}>
                    <Box className={classes.caption}>
                        <Tabs value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                            {assetTabs.map((key) => (
                                <Tab key={key} value={key} label={assetTabsLabel[key]} />
                            ))}
                        </Tabs>
                        <Button
                            color="secondary"
                            className={classes.addCustomTokenButton}
                            onClick={() =>
                                activeTab === AssetTab.Token
                                    ? setSelectToken({ open: true, props: { whitelist: [] } })
                                    : setAddCollectibleOpen(true)
                            }>
                            +{' '}
                            {activeTab === AssetTab.Token
                                ? t.wallets_add_token()
                                : t.wallets_assets_custom_collectible()}
                        </Button>
                    </Box>
                    <TabPanel
                        value={AssetTab.Token}
                        key={AssetTab.Token}
                        className={activeTab === AssetTab.Token ? classes.tab : undefined}>
                        <TokenTable />
                    </TabPanel>
                    <TabPanel
                        value={AssetTab.Collectibles}
                        key={AssetTab.Collectibles}
                        className={activeTab === AssetTab.Collectibles ? classes.tab : undefined}>
                        <CollectibleList />
                    </TabPanel>
                </TabContext>
            </ContentContainer>
            {addCollectibleOpen && (
                <AddCollectibleDialog open={addCollectibleOpen} onClose={() => setAddCollectibleOpen(false)} />
            )}
        </>
    )
})
