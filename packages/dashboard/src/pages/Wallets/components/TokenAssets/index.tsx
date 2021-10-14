import { memo, useState } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { Box, Button, Tab } from '@material-ui/core'
import { makeStyles, useTabs } from '@masknet/theme'
import { TokenTable } from '../TokenTable'
import { useDashboardI18N } from '../../../../locales'
import { CollectibleList } from '../CollectibleList'
import { AddCollectibleDialog } from '../AddCollectibleDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../../../API'
import type { ChainId } from '@masknet/web3-shared'
import { useCurrentCollectibleDataProvider } from '../../api'

const useStyles = makeStyles()((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addCustomTokenButton: {
        borderRadius: Number(theme.shape.borderRadius) * 3.5,
        fontSize: theme.typography.caption.fontSize,
    },
    tab: {
        flex: 1,
        padding: '0px',
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

interface TokenAssetsProps {
    selectedChainId: ChainId | null
}

export const TokenAssets = memo<TokenAssetsProps>(({ selectedChainId }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const assetTabsLabel: Record<AssetTab, string> = {
        [AssetTab.Token]: t.wallets_assets_token(),
        [AssetTab.Investment]: t.wallets_assets_investment(),
        [AssetTab.Collectibles]: t.wallets_assets_collectibles(),
    }
    // Workaround: if useCurrentCollectibleDataProvider hook in CollectibleList component, will lead tooltip error: Maximum update depth exceeded.
    const provider = useCurrentCollectibleDataProvider()

    const [currentTab, onChange] = useTabs(AssetTab.Token, AssetTab.Collectibles)

    const [addCollectibleOpen, setAddCollectibleOpen] = useState(false)
    const { setDialog: setSelectToken } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectERC20TokenDialogUpdated,
    )

    return (
        <>
            <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
                <TabContext value={currentTab}>
                    <Box className={classes.caption}>
                        <TabList onChange={onChange}>
                            {assetTabs.map((key) => (
                                <Tab key={key} value={key} label={assetTabsLabel[key]} />
                            ))}
                        </TabList>
                        <Button
                            size="small"
                            color="secondary"
                            className={classes.addCustomTokenButton}
                            onClick={() =>
                                currentTab === AssetTab.Token
                                    ? setSelectToken({ open: true, props: { whitelist: [] } })
                                    : setAddCollectibleOpen(true)
                            }>
                            +{' '}
                            {currentTab === AssetTab.Token
                                ? t.wallets_add_token()
                                : t.wallets_assets_custom_collectible()}
                        </Button>
                    </Box>
                    <TabPanel value={AssetTab.Token} key={AssetTab.Token} sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <TokenTable selectedChainId={selectedChainId} />
                    </TabPanel>
                    <TabPanel
                        value={AssetTab.Collectibles}
                        key={AssetTab.Collectibles}
                        sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <CollectibleList selectedChainId={selectedChainId} provider={provider} />
                    </TabPanel>
                </TabContext>
            </ContentContainer>
            {addCollectibleOpen && (
                <AddCollectibleDialog open={addCollectibleOpen} onClose={() => setAddCollectibleOpen(false)} />
            )}
        </>
    )
})
