import { memo, useEffect } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer/index.js'
import { Box, Tab } from '@mui/material'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { TransferERC20 } from './TransferERC20.js'
import { useLocation } from 'react-router-dom'
import { useDashboardI18N } from '../../../../locales/index.js'
import { TransferERC721 } from './TransferERC721.js'
import { TransferTab } from './types.js'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import { useContainer } from 'unstated-next'
import { Context } from '../../hooks/useContext.js'

const assetTabs = [TransferTab.Token, TransferTab.Collectibles] as const

export * from './types.js'

export const Transfer = memo(() => {
    const t = useDashboardI18N()
    const { state } = useLocation() as {
        state: {
            token?: FungibleToken<ChainId, SchemaType>
            nonFungibleToken?: FungibleToken<ChainId, SchemaType>
            type?: TransferTab
        } | null
    }
    const { chainId } = useContainer(Context)
    const Others = useWeb3Others()
    const nativeToken = Others.createNativeToken(chainId)
    const transferTabsLabel: Record<TransferTab, string> = {
        [TransferTab.Token]: t.wallets_assets_token(),
        [TransferTab.Collectibles]: t.wallets_assets_collectibles(),
    }
    const [currentTab, onChange, , setTab] = useTabs(TransferTab.Token, TransferTab.Collectibles)
    console.log({ state })
    useEffect(() => {
        if (!state) return
        if (!state.nonFungibleToken || state.type !== TransferTab.Collectibles) return

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
