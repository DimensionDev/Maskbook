import { memo, useEffect, useState } from 'react'
import { useCurrentWeb3NetworkPluginID, Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab } from '@mui/material'
import { usePickToken } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ContentContainer } from '../../../../components/ContentContainer'
import { useDashboardI18N } from '../../../../locales'
import { AddCollectibleDialog } from '../AddCollectibleDialog'
import { CollectibleList } from '../CollectibleList'
import { FungibleTokenTable } from '../FungibleTokenTable'

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
        padding: 0,
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
    network: Web3Helper.NetworkDescriptorAll | null
}

export const Assets = memo<TokenAssetsProps>(({ network }) => {
    const t = useDashboardI18N()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { classes } = useStyles()
    const assetTabsLabel: Record<AssetTab, string> = {
        [AssetTab.Token]: t.wallets_assets_token(),
        [AssetTab.Investment]: t.wallets_assets_investment(),
        [AssetTab.Collectibles]: t.wallets_assets_collectibles(),
    }

    const [currentTab, onChange, , setTab] = useTabs(AssetTab.Token, AssetTab.Collectibles)

    const [addCollectibleOpen, setAddCollectibleOpen] = useState(false)

    useEffect(() => {
        setTab(AssetTab.Token)
    }, [pluginId])

    const showCollectibles = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginId)
    const pickToken = usePickToken()

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
                                onClick={async () => {
                                    if (currentTab === AssetTab.Token) {
                                        // TODO handle result
                                        await pickToken({
                                            whitelist: [],
                                            title: t.wallets_add_token(),
                                        })
                                    } else {
                                        setAddCollectibleOpen(true)
                                    }
                                }}>
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
            {addCollectibleOpen && <AddCollectibleDialog open onClose={() => setAddCollectibleOpen(false)} />}
        </>
    )
})
