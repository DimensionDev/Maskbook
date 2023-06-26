import { memo, useCallback, useEffect, useState } from 'react'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Button, Tab } from '@mui/material'
import {
    CollectionList,
    UserAssetsProvider,
    type CollectibleGridProps,
    SelectFungibleTokenModal,
} from '@masknet/shared'
import { DashboardRoutes, NetworkPluginID } from '@masknet/shared-base'
import { ContentContainer } from '../../../../components/ContentContainer/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { AddCollectibleDialog } from '../AddCollectibleDialog/index.js'
import { FungibleTokenTable } from '../FungibleTokenTable/index.js'
import { useNavigate } from 'react-router-dom'
import { TransferTab } from '../Transfer/index.js'
import { Context } from '../../hooks/useContext.js'
import { useContainer } from 'unstated-next'

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
}))

export enum AssetTab {
    Token = 'Token',
    Investment = 'Investment',
    Collectibles = 'Collectibles',
}

const assetTabs = [AssetTab.Token, AssetTab.Collectibles] as const

export interface AssetsProps {
    network: Web3Helper.NetworkDescriptorAll | null
}

const gridProps: CollectibleGridProps = {
    columns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 4,
}
export const Assets = memo<AssetsProps>(({ network }) => {
    const { chainId } = useContainer(Context)
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { pluginID } = useNetworkContext()
    const { account } = useChainContext()
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
    }, [pluginID])

    const showCollectibles = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID)
    const handleActionClick = useCallback(
        (asset: Web3Helper.NonFungibleAssetAll) => {
            // Sending NFT is only available on EVM currently.
            if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
            navigate(DashboardRoutes.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    nonFungibleToken: { ...asset, chainId },
                },
            })
        },
        [pluginID, chainId],
    )

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
                        {pluginID === NetworkPluginID.PLUGIN_EVM && network ? (
                            <Button
                                size="small"
                                color="secondary"
                                className={classes.addCustomTokenButton}
                                onClick={async () => {
                                    if (currentTab === AssetTab.Token) {
                                        await SelectFungibleTokenModal.openAndWaitForClose({
                                            whitelist: [],
                                            title: t.wallets_add_token(),
                                            chainId: network?.chainId,
                                            enableManage: false,
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
                        ) : null}
                    </Box>
                    <TabPanel value={AssetTab.Token} key={AssetTab.Token} sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <FungibleTokenTable selectedChainId={network?.chainId} />
                    </TabPanel>
                    <TabPanel
                        value={AssetTab.Collectibles}
                        key={AssetTab.Collectibles}
                        sx={{ minHeight: 'calc(100% - 48px)' }}>
                        <UserAssetsProvider pluginID={pluginID} address={account}>
                            <CollectionList
                                pluginID={pluginID}
                                defaultChainId={network?.chainId}
                                account={account}
                                gridProps={gridProps}
                                disableSidebar
                                disableAction={false}
                                onActionClick={handleActionClick}
                            />
                        </UserAssetsProvider>
                    </TabPanel>
                </TabContext>
            </ContentContainer>
            {addCollectibleOpen && network ? (
                <AddCollectibleDialog selectedNetwork={network} open onClose={() => setAddCollectibleOpen(false)} />
            ) : null}
        </>
    )
})
