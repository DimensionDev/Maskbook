import { memo, useEffect } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@mui/material'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { TransferERC20 } from './TransferERC20'
import { useLocation } from 'react-router-dom'
import { useDashboardI18N } from '../../../../locales'
import { TransferERC721 } from './TransferERC721'
import { TransferTab } from './types'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useNativeToken } from '@masknet/plugin-infra/web3'

const assetTabs = [TransferTab.Token, TransferTab.Collectibles] as const

export * from './types'

export const Transfer = memo(() => {
    const t = useDashboardI18N()
    const { state } = useLocation() as {
        state: {
            token?: FungibleToken<ChainId, SchemaType>
            erc721Token?: FungibleToken<ChainId, SchemaType>
            type?: TransferTab
        } | null
    }
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const transferTabsLabel: Record<TransferTab, string> = {
        [TransferTab.Token]: t.wallets_assets_token(),
        [TransferTab.Collectibles]: t.wallets_assets_collectibles(),
    }
    const [currentTab, onChange, , setTab] = useTabs(TransferTab.Token, TransferTab.Collectibles)

    useEffect(() => {
        if (!state) return
        if (!state.erc721Token || state.type !== TransferTab.Collectibles) return

        setTab(TransferTab.Collectibles)
    }, [state])

    if (!nativeToken && !state?.token) return null

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box>
                <TabContext value={currentTab}>
                    <TabList onChange={onChange}>
                        {assetTabs.map((key) => (
                            <Tab key={key} value={key} label={transferTabsLabel[key]} />
                        ))}
                    </TabList>
                    <TabPanel value={TransferTab.Token}>
                        <TransferERC20 token={state?.token! || nativeToken} />
                    </TabPanel>
                    <TabPanel value={TransferTab.Collectibles}>
                        <TransferERC721 />
                    </TabPanel>
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
