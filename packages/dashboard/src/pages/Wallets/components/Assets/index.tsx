import { memo, useEffect, useState } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab } from '@mui/material'
import { makeStyles, useTabs } from '@masknet/theme'
import { FungibleTokenTable } from '../FungibleTokenTable'
import { useDashboardI18N } from '../../../../locales'
import { CollectibleList } from '../CollectibleList'
import { AddCollectibleDialog } from '../AddCollectibleDialog'
import { useRemoteControlledDialog } from '@masknet/shared-base'
import { PluginMessages } from '../../../../API'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, usePluginIDContext } from '@masknet/plugin-infra'
import { v4 as uuid } from 'uuid'

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
    network: Web3Plugin.NetworkDescriptor | null
}

export const Assets = memo<TokenAssetsProps>(({ network }) => {
    const t = useDashboardI18N()
    const pluginId = usePluginIDContext()
    const { classes } = useStyles()
    const [id] = useState(uuid())
    const assetTabsLabel: Record<AssetTab, string> = {
        [AssetTab.Token]: t.wallets_assets_token(),
        [AssetTab.Investment]: t.wallets_assets_investment(),
        [AssetTab.Collectibles]: t.wallets_assets_collectibles(),
    }

    const [currentTab, onChange, , setTab] = useTabs(AssetTab.Token, AssetTab.Collectibles)

    const [addCollectibleOpen, setAddCollectibleOpen] = useState(false)
    const { setDialog: setSelectToken } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectTokenDialogUpdated,
    )

    useEffect(() => {
        setTab(AssetTab.Token)
    }, [pluginId])

    const showCollectibles = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginId)

    return (
        <>
            <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
                <TabContext value={currentTab}>
                    <Box className={classes.caption}>
                        <TabList onChange={onChange}>
                            {assetTabs
                                .filter((x) => showCollectibles || x === AssetTab.Token)
                                .map((key) => (
                                    <Tab key={key} value={key} label={assetTabsLabel[key]} />
                                ))}
                        </TabList>
                        {pluginId === NetworkPluginID.PLUGIN_EVM && (
                            <Button
                                size="small"
                                color="secondary"
                                className={classes.addCustomTokenButton}
                                onClick={() =>
                                    currentTab === AssetTab.Token
                                        ? setSelectToken({
                                              open: true,
                                              uuid: id,
                                              FungibleTokenListProps: { whitelist: [] },
                                          })
                                        : setAddCollectibleOpen(true)
                                }>
                                +{' '}
                                {currentTab === AssetTab.Token
                                    ? t.wallets_add_token()
                                    : t.wallets_assets_custom_collectible()}
                            </Button>
                        )}
                    </Box>
                    <TabPanel value={AssetTab.Token} key={AssetTab.Token} sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <FungibleTokenTable selectedChainId={network?.chainId ?? null} />
                    </TabPanel>
                    <TabPanel
                        value={AssetTab.Collectibles}
                        key={AssetTab.Collectibles}
                        sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <CollectibleList selectedNetwork={network} />
                    </TabPanel>
                </TabContext>
            </ContentContainer>
            {addCollectibleOpen && (
                <AddCollectibleDialog open={addCollectibleOpen} onClose={() => setAddCollectibleOpen(false)} />
            )}
        </>
    )
})
